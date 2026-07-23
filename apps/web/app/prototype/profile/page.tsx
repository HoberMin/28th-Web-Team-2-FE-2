"use client";

// 개인정보 온보딩 — 4스텝 위저드. 카테고리(관심 테마)는 여기서 안 고른다(결과 필터로 이동).
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { RadioGroup, RadioGroupItem } from "seed-design/ui/radio-group";
import {
  EDUCATION_OPTIONS,
  EMPLOYMENT_OPTIONS,
  INCOME_OPTIONS,
  REGION_OPTIONS,
  type EducationChoice,
  type EmploymentChoice,
  type IncomeBand,
  type RegionChoice,
} from "@/lib/youth-policy/profile";
import { usePrototypeSession } from "../_lib/session";
import { Shell } from "../_lib/ui";

const TOTAL_STEPS = 4;

const STEP_META = [
  { title: "나이가 어떻게 되세요?", description: "만 나이로 알려주세요. 대부분 정책이 연령으로 대상을 가려요." },
  { title: "어디에 사세요?", description: "지역 한정 정책을 가려내는 데 써요." },
  { title: "지금 어떤 상태예요?", description: "고용 형태에 따라 대상 여부가 달라져요." },
  { title: "소득과 학력을 알려주세요", description: "정밀 판정에 쓰여요. 소득은 모르면 '무관'으로." },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { data, loaded, update } = usePrototypeSession();

  const [step, setStep] = useState(1);
  const [age, setAge] = useState("");
  const [region, setRegion] = useState<RegionChoice | "">("");
  const [employment, setEmployment] = useState<EmploymentChoice | "">("");
  const [incomeBand, setIncomeBand] = useState<IncomeBand | "">("");
  const [education, setEducation] = useState<EducationChoice | "">("");

  // 세션 복원은 최초 1회만 — data가 update()로 바뀔 때마다 재실행하면
  // 미저장 스텝의 입력을 세션값으로 되돌려버린다.
  const restored = useRef(false);
  useEffect(() => {
    if (!loaded || restored.current) return;
    if (!data.nickname) {
      router.replace("/prototype");
      return;
    }
    restored.current = true;
    if (typeof data.age === "number") setAge(String(data.age));
    if (data.region) setRegion(data.region);
    if (data.employment) setEmployment(data.employment);
    if (data.incomeBand) setIncomeBand(data.incomeBand);
    if (data.education) setEducation(data.education);
  }, [loaded, data, router]);

  const ageNum = Number(age);
  const ageValid = age !== "" && Number.isFinite(ageNum) && ageNum > 0 && ageNum < 120;

  const stepValid =
    step === 1
      ? ageValid
      : step === 2
        ? !!region
        : step === 3
          ? !!employment
          : !!incomeBand && !!education;

  const handleBack = () => {
    if (step === 1) router.push("/prototype");
    else setStep((s) => s - 1);
  };

  const handleNext = () => {
    if (!stepValid) return;
    // 스텝별로 세션에 저장 → 새로고침·뒤로가기에도 유지
    if (step === 1) update({ age: ageNum });
    if (step === 2) update({ region: region as RegionChoice });
    if (step === 3) update({ employment: employment as EmploymentChoice });
    if (step === 4) {
      update({
        incomeBand: incomeBand as IncomeBand,
        education: education as EducationChoice,
      });
      router.push("/prototype/recommend");
      return;
    }
    setStep((s) => s + 1);
  };

  const meta = STEP_META[step - 1];

  return (
    <Shell
      title={meta.title}
      description={meta.description}
      step={step}
      totalSteps={TOTAL_STEPS}
      footer={
        <div className="flex gap-2">
          <ActionButton variant="neutralWeak" onClick={handleBack}>
            이전
          </ActionButton>
          <ActionButton className="flex-1" disabled={!stepValid} onClick={handleNext}>
            {step === TOTAL_STEPS ? "결과 보기" : "다음"}
          </ActionButton>
        </div>
      }
    >
      {step === 1 && (
        <TextField
          label="나이 (만 나이)"
          value={age}
          onValueChange={({ value }) => setAge(value.replace(/[^0-9]/g, ""))}
        >
          <TextFieldInput inputMode="numeric" placeholder="예: 29" />
        </TextField>
      )}

      {step === 2 && (
        <RadioGroup
          label="거주 지역"
          value={region}
          onValueChange={(v) => setRegion(v as RegionChoice)}
        >
          {REGION_OPTIONS.map((o) => (
            <RadioGroupItem key={o} value={o} label={o} />
          ))}
        </RadioGroup>
      )}

      {step === 3 && (
        <RadioGroup
          label="현재 상태"
          value={employment}
          onValueChange={(v) => setEmployment(v as EmploymentChoice)}
        >
          {EMPLOYMENT_OPTIONS.map((o) => (
            <RadioGroupItem key={o} value={o} label={o} />
          ))}
        </RadioGroup>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-7">
          <RadioGroup
            label="연 소득 구간"
            description="모르면 '무관'을 골라도 돼요."
            value={incomeBand}
            onValueChange={(v) => setIncomeBand(v as IncomeBand)}
          >
            {INCOME_OPTIONS.map((o) => (
              <RadioGroupItem key={o.value} value={o.value} label={o.label} />
            ))}
          </RadioGroup>

          <RadioGroup
            label="학력"
            value={education}
            onValueChange={(v) => setEducation(v as EducationChoice)}
          >
            {EDUCATION_OPTIONS.map((o) => (
              <RadioGroupItem key={o} value={o} label={o} />
            ))}
          </RadioGroup>
        </div>
      )}
    </Shell>
  );
}
