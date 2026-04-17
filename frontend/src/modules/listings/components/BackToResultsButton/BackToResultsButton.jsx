import { useLocation, useNavigate } from "react-router-dom";

const BackToResultsButton = ({
  className = "back-button",
  children = "← Back to listings",
  fallbackPath = "/listings",
  type = "button",
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate(location.state?.from || fallbackPath);
  };

  return (
    <button type={type} className={className} onClick={handleBack}>
      {children}
    </button>
  );
};

export default BackToResultsButton;