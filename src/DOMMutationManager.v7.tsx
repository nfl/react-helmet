import { useEffect } from "react";
import { useHelmet } from "./HelmetContext";

// $FIXME: Refactor is complete when this is removed
type $FIXME = any;

export const DOMMutationManager = (helmetProps: $FIXME) => {
  const [, dispatch] = useHelmet();

  useEffect(() => {
    dispatch({ type: "add", instance: helmetProps });

    return () => dispatch({ type: "remove", instance: helmetProps });
  }, [dispatch, helmetProps]);

  return null;
};
