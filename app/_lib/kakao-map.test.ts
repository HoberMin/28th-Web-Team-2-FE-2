import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class ScriptStub extends EventTarget {
  id = "";
  async = false;
  src = "";
  connected = false;
  onRemove: (() => void) | null = null;

  remove(): void {
    this.connected = false;
    this.onRemove?.();
  }
}

function installDom() {
  const created: ScriptStub[] = [];
  let current: ScriptStub | null = null;

  vi.stubGlobal("window", {});
  vi.stubGlobal("document", {
    getElementById: (id: string) => (current?.id === id ? current : null),
    createElement: () => {
      const script = new ScriptStub();
      created.push(script);
      return script;
    },
    head: {
      appendChild: (script: ScriptStub) => {
        current = script;
        script.connected = true;
        script.onRemove = () => {
          if (current === script) current = null;
        };
        return script;
      },
    },
  });

  return { created, current: () => current };
}

describe("loadKakaoSdk", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("load 후 전역이 없으면 실패 스크립트를 제거하고 다음 호출이 재시도한다", async () => {
    const dom = installDom();
    const { loadKakaoSdk } = await import("./kakao-map");

    const first = loadKakaoSdk("app-key");
    dom.created[0].dispatchEvent(new Event("load"));
    await expect(first).resolves.toBeNull();
    expect(dom.current()).toBeNull();

    const second = loadKakaoSdk("app-key");
    expect(dom.created).toHaveLength(2);
    dom.created[1].dispatchEvent(new Event("error"));
    await expect(second).resolves.toBeNull();
    expect(dom.current()).toBeNull();
  });

  it("동시에 호출하면 하나의 진행 중 요청을 공유한다", async () => {
    const dom = installDom();
    const { loadKakaoSdk } = await import("./kakao-map");

    const first = loadKakaoSdk("app-key");
    const second = loadKakaoSdk("app-key");

    expect(second).toBe(first);
    expect(dom.created).toHaveLength(1);
    dom.created[0].dispatchEvent(new Event("error"));
    await expect(first).resolves.toBeNull();
  });
});
