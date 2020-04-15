import { useEffect } from "react";
import { useHelmet } from "./HelmetContext";
// import isEqual from "react-fast-compare";

// $FIXME: Refactor is complete when this is removed
type $FIXME = any;

export const DOMMutationManager = ({ ...helmetProps }: $FIXME) => {
  const [, dispatch] = useHelmet();

  useEffect(() => {
    dispatch({ type: "add", instance: helmetProps });

    return () => dispatch({ type: "remove", instance: helmetProps });
  }, []);
  //   useEffect(() => {
  //     if (!isEqual(helmetState, props)) {
  //       setHelmetState(props);
  //     }
  //   }, [props]);

  return null;
};
