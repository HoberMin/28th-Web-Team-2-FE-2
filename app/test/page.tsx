export default function TestPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <p>CI/CD 배포 테스트 페이지 — {new Date().toISOString()}</p>
    </main>
  );
}
