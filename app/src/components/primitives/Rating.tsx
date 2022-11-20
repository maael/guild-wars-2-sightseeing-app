import { FaStar } from "react-icons/fa";

export default function Rating({
  rating,
}: {
  rating?: { avgRating?: number; count?: number };
}) {
  return (
    <div className="flex flex-row gap-1">
      <FaStar /> {(rating?.avgRating || 0).toFixed(1)} ({rating?.count || 0})
    </div>
  );
}
