export function calcLocalScore(selectedMoon, selectedTime, selectedRoute) {
  const moonExposure = { full: 90, half: 50, new: 20 };
  const timeExposure = { afterTwilight: 85, beforeMoonrise: 15, moonHigh: 55, dawn: 25 };
  const routeExposure = { routeA: 75, routeB: 20, routeC: 50 };

  const exposure = Math.min(
    100,
    Math.round(
      ((moonExposure[selectedMoon] ?? 50) +
        (timeExposure[selectedTime] ?? 50) +
        (routeExposure[selectedRoute] ?? 50)) /
        3
    )
  );

  const routeMobility = { routeA: 65, routeB: 85, routeC: 30 };
  const timeMobility = { afterTwilight: 30, beforeMoonrise: 65, moonHigh: 45, dawn: 70 };

  const mobility = Math.min(
    100,
    Math.round(
      ((routeMobility[selectedRoute] ?? 50) + (timeMobility[selectedTime] ?? 50)) / 2
    )
  );

  const moonNav = { full: 30, half: 55, new: 80 };
  const routeNav = { routeA: 40, routeB: 45, routeC: 75 };
  const timeNav = { afterTwilight: 45, beforeMoonrise: 85, moonHigh: 50, dawn: 60 };

  const navigation = Math.min(
    100,
    Math.round(
      ((moonNav[selectedMoon] ?? 50) +
        (routeNav[selectedRoute] ?? 50) +
        (timeNav[selectedTime] ?? 50)) /
        3
    )
  );

  const overall = Math.round(
    (100 - exposure) * 0.45 + (100 - mobility) * 0.25 + navigation * 0.3
  );

  const levelBad = (s) => (s >= 70 ? "높음" : s >= 40 ? "중간" : "낮음");
  const levelGood = (s) => (s >= 65 ? "높음" : s >= 40 ? "중간" : "낮음");
  const overallLabel = (s) => (s >= 72 ? "우수" : s >= 52 ? "보통" : "미흡");

  return {
    exposure,
    mobility,
    navigation,
    overall,
    exposureLevel: levelBad(exposure),
    mobilityLevel: levelBad(mobility),
    navigationLevel: levelGood(navigation),
    overallLabel: overallLabel(overall),
  };
}
