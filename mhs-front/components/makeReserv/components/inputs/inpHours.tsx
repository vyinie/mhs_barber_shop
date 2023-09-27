"use client";
import { useEffect, useState } from "react";
import { ReservProps, setReserv } from "../../MakeReserv";

import axios from "axios";
import moment from "moment";

import InpPopover from "./InpPopOver";
import HoursList from "../HoursList";

import { Search } from "@mui/icons-material";

export interface ReservTime {
  number: string;
  available: boolean;
}
export interface ReservTimeList {
  mainList: ReservTime[];
  backUpList: ReservTime[];
}

export default function InpHours({
  reservData,
  setReservData,
}: {
  reservData: ReservProps;
  setReservData: setReserv;
}) {
  const [avaliableHours, setAvaliableHours] = useState<ReservTimeList>({
    mainList: [],
    backUpList: [],
  });

  const [filterParam, setFilterParam] = useState("");
  const [filterToggle, setFilterToggle] = useState(false);

  const [hourListToggle, setHourListToggle] = useState(false);

  function openList(e: any) {
    setHours().then(() => {
      e.target.className.includes("open_list") &&
        setHourListToggle((old) => !old);
    });
  }

  function openFilter(e: any) {
    if (e.target.className.includes("open_filter")) {
      setFilterToggle((old) => {
        old === false && setHourListToggle(true);
        return !old;
      });

      setTimeout(() => {
        document.getElementById("timeFilterInp")?.focus();
      }, 200);
    }
  }

  async function setHours() {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/gethourslist/${reservData.dateTime}`
      )
      .then((res) => {
        const hoursList: ReservTime[] = res.data || [];
        setAvaliableHours(() => ({
          mainList: hoursList,
          backUpList: hoursList,
        }));
      });
  }

  function filterHours() {
    const avaliableHoursHolder = avaliableHours.backUpList.filter((i) =>
      moment(i.number).format("HH").includes(filterParam)
    );
    setAvaliableHours((old) => ({
      mainList: avaliableHoursHolder,
      backUpList: old.backUpList,
    }));
  }

  useEffect(() => {
    filterParam.length > 2 && setFilterParam((old) => old.slice(0, 2));
    filterParam !== "" ? filterHours() : setHours();
  }, [filterParam]);

  return (
    <div
      className={`${
        hourListToggle ? "bg-white -translate-y-[30vh]" : ""
      } transition-all cursor-pointer`}
    >
      <h1 className="InpTitleLabel">
        {hourListToggle ? "Horários Disponíveis" : "Horário"}
      </h1>

      <div
        onClick={openList}
        className={`open_list formInp grid place-items-center grid-cols-6 relative text-2xl`}
      >
        <p className="col-span-5 open_list">
          {moment(reservData.dateTime).format("HH : mm")}
        </p>
        <div
          className={`${
            hourListToggle ? "p-1" : "h-0"
          } w-full max-h-[300px] absolute top-full  overflow-y-auto rounded `}
        >
          <HoursList
          setFilterToggle={setFilterToggle}
            availableHours={avaliableHours.mainList}
            setReservData={setReservData}
          />
        </div>
        <button onClick={openFilter} className="relative w-8 h-8">
          <div className="kase open_filter"></div>
          <Search sx={{ fontSize: "30px" }} />
        </button>
        <InpPopover
          filterParam={filterParam}
          setFilterParam={setFilterParam}
          openFilter={openFilter}
          toggle={filterToggle}
        />
      </div>
    </div>
  );
}
