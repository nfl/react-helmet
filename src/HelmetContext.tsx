import React, {
  FunctionComponent,
  useContext,
  useReducer,
  useEffect,
} from "react";
import { reducePropsToState, handleClientStateChange } from "./HelmetUtils";
import { HelmetPropsListItem } from "./types";

type Action = {
  type: "add" | "remove";
  instance: any;
};
type Dispatch = (action: Action) => void;
type State = HelmetPropsListItem[];
const HelmetStateContext = React.createContext<State | undefined>(undefined);
const HelmetDispatchContext = React.createContext<Dispatch | undefined>(
  undefined
);

function emitChange(helmetInstances: State) {
  const state = reducePropsToState(helmetInstances);
  console.log("state?", state);
  if (HelmetProvider.canUseDOM) {
    handleClientStateChange(state);
  }
}

function helmetReducer(helmetInstances: State, action: Action) {
  console.log(action);
  switch (action.type) {
    case "add": {
      return [...helmetInstances, action.instance];
    }
    case "remove": {
      const index = helmetInstances.indexOf(action.instance);
      helmetInstances.splice(index, 1);

      return [...helmetInstances];
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export const HelmetProvider: FunctionComponent & { canUseDOM: boolean } = ({
  children,
}) => {
  const [helmetState, dispatch] = useReducer(helmetReducer, []);

  useEffect(() => {
    console.log("helmetState?", helmetState);
    emitChange(helmetState);
  }, [helmetState]);

  return (
    <HelmetStateContext.Provider value={helmetState}>
      <HelmetDispatchContext.Provider value={dispatch}>
        {children}
      </HelmetDispatchContext.Provider>
    </HelmetStateContext.Provider>
  );
};

HelmetProvider.canUseDOM = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

export function useHelmetState() {
  const context = useContext(HelmetStateContext);

  if (context === undefined) {
    throw new Error("useHelmetState must be used within a <HelmetProvider>");
  }

  return context;
}

export function useHelmetDispatch() {
  const context = useContext(HelmetDispatchContext);

  if (context === undefined) {
    throw new Error("useHelmetDispatch must be used within a <HelmetProvider>");
  }

  return context;
}

export function useHelmet() {
  return [useHelmetState(), useHelmetDispatch()] as const;
}
