import React from "react";
import { FaChevronLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { getAvatar } from "../../util";

export default function UserScreen() {
  const navigate = useNavigate();
  const params = useParams();
  return (
    <div className="px-3">
      <div className="relative flex flex-row gap-1 text-center justify-center items-center w-full p-5 mb-3">
        <FaChevronLeft
          className="absolute left-0 top-8 text-3xl cursor-pointer hover:scale-110"
          onClick={() => {
            navigate(-1);
          }}
        />
        <div className="flex flex-col justify-center items-center gap-2">
          <img
            src={getAvatar(params.account)}
            className="rounded-full w-20 h-20"
          />
          <h1 className="text-3xl">{params.account}</h1>
        </div>
      </div>
    </div>
  );
}
