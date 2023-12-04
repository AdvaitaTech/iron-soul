import { Reducer, useEffect, useReducer, useState } from "react";
import {
  PlanResponse,
  WorkoutResponse,
  fetchPlansApi,
  fetchWorkoutsApi,
} from "./network-utils";

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
      .catch((e) => {
        console.error("fetch plans error", e);
        dispatch({ type: "loadError", error: e.toString() });
      });
  }, []);

  return { isLoading, plans, error };
};

type WorkoutsState = {
  isLoading: boolean;
  error: string | null;
  workouts: WorkoutResponse[];
  limit: number;
  offset: number;
};

const InitialWorkoutState: WorkoutsState = {
  isLoading: false,
  error: null,
  workouts: [],
  limit: 10,
  offset: 0,
};

type WorkoutActions =
  | {
      type: "loadStart";
      limit?: number;
      offset?: number;
    }
  | {
      type: "loadSuccess";
      workouts: WorkoutResponse[];
    }
  | {
      type: "loadError";
      error: string;
    };

export const useWorkouts = () => {
  const [{ isLoading, workouts, error }, dispatch] = useReducer<
    Reducer<WorkoutsState, WorkoutActions>
  >(
    (state, action) => {
      switch (action.type) {
        case "loadStart": {
          return {
            ...state,
            isLoading: true,
            limit: action.limit !== undefined ? action.limit : state.limit,
            offset: action.offset !== undefined ? action.offset : state.offset,
          };
        }
        case "loadSuccess": {
          return {
            ...state,
            isLoading: false,
            workouts: action.workouts,
          };
        }
        case "loadError": {
          return {
            ...state,
            isLoading: false,
            error: action.error,
          };
        }
      }
    },
    { ...InitialWorkoutState }
  );

  useEffect(() => {
    dispatch({ type: "loadStart" });
    fetchWorkoutsApi(10, 0)
      .then((workouts) => {
        dispatch({
          type: "loadSuccess",
          workouts,
        });
      })
      .catch((e) => {
        console.error("fetch workouts error", e);
        dispatch({ type: "loadError", error: e.toString() });
      });
  }, []);

  return { isLoading, workouts, error };
};
