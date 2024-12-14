import axios from "axios";
import BigNumber from "bignumber.js";
import { FetchResult } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";

const fetch = async (timestamp: number): Promise<FetchResult> => {
  const perpsInfoApi = `https://backend.prod.mars-dev.net/v2/perps_overview?chain=neutron&days=2&response_type=global`;
  const perpsVolumeData = await axios(perpsInfoApi);
  const globalOverview = perpsVolumeData.data.global_overview;

  let last24HourVolume = 0;
  let fetchTimestamp = timestamp;

  // The second element in the array is the last 24 hour volume, while the first element is the current volume of the ongoing day
  if (globalOverview && globalOverview.daily_trading_volume.length > 1) {
    // Volume is returned in uusd which has 6 decimals
    last24HourVolume = new BigNumber(
      globalOverview.daily_trading_volume[1].value
    )
      .shiftedBy(-6)
      .toNumber();
    fetchTimestamp = Math.round(
      new Date(globalOverview.daily_trading_volume[1].date).getTime() / 1000
    );
  }

  return {
    dailyVolume: last24HourVolume,
    timestamp: fetchTimestamp,
  };
};

const adapter = {
  version: 2,
  breakdown: {
    derivatives: {
      [CHAIN.NEUTRON]: {
        fetch,
        runAtCurrTime: true,
        start: "2024-12-13",
      },
    },
  },
};
export default adapter;
