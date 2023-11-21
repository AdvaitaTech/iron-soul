import { Reducer, useEffect, useReducer, useState } from "react";
import { PlanResponse, fetchPlansApi } from "./network-utils";

type UsePlanState = {
  isLoading: boolean;
  plans: PlanResponse[];
  error: string;
};
const initialState: UsePlanState = {
  isLoading: false,
  plans: [],
  error: "",
};
type PlanActions =
  | {
      type: "loadStart";
    }
  | {
      type: "loadSuccess";
      plans: PlanResponse[];
    }
  | {
      type: "loadError";
      error: string;
    };

export const usePlans = () => {
  const [{ isLoading, plans, error }, dispatch] = useReducer<
    Reducer<UsePlanState, PlanActions>
  >((state, action) => {
    console.log("got plan action", action);
    switch (action.type) {
      case "loadStart": {
        return { ...state, isLoading: true, plans: [] };
      }
      case "loadSuccess": {
        return { ...state, isLoading: false, plans: action.plans };
      }
      case "loadError": {
        return { ...state, isLoading: false, error: action.error };
      }
    }
  }, initialState);

  useEffect(() => {
    dispatch({ type: "loadStart" });
    fetchPlansApi()
      .then((plans) => {
        dispatch({ type: "loadSuccess", plans });
      })
      .catch((e) => dispatch({ type: "loadError", error: e.toString() }));
  }, []);

  return { isLoading, plans, error };
};
