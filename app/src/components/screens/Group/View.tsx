import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { WithRating, GroupDocument } from "../../../types";
import PageHeader from "../../primitives/PageHeader";

export default function GroupViewScreen() {
  const { id } = useParams();
  const { isLoading, error, data } = useQuery<WithRating<GroupDocument>>(
    [`group/${id}`],
    () =>
      fetch(`http://localhost:3000/api/groups/${id}`).then((res) => res.json())
  );

  if (isLoading) return <div>"Loading...";</div>;

  if (error)
    return <div>"An error has occurred: " + (error as Error).message</div>;
  return (
    <div>
      <PageHeader>Group View</PageHeader>
      <Link to={`/groups/${id}/edit`}>Edit</Link>
      {JSON.stringify(data)}
    </div>
  );
}
