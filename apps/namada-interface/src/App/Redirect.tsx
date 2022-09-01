import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TopLevelRoute } from "./types";

type Props = {
  password?: string;
};

const Redirect = ({ password }: Props): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!password) {
      const { pathname } = location;
      navigate(`${TopLevelRoute.Home}?redirect=${pathname}`);
    }
  });

  return <div>Redirecting...</div>;
};

export default Redirect;
