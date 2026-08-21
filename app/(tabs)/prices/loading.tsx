import { LoadingCircular } from "../../_components/loading-circular";

export default function PricesLoading() {
  return (
    <div className="flex justify-center px-4 pt-6 pb-20 text-content-secondary">
      <div className="py-20">
        <LoadingCircular animate currentColor className="text-content-brand-light" label="야채 시세를 불러오고 있어요" />
      </div>
    </div>
  );
}
