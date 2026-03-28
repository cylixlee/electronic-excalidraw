import React from "react";

import "./LiveCollaborationTrigger.scss";

const LiveCollaborationTrigger = ({
  isCollaborating,
  onSelect,
  ...rest
}: {
  isCollaborating: boolean;
  onSelect: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return null;
};

export default LiveCollaborationTrigger;
LiveCollaborationTrigger.displayName = "LiveCollaborationTrigger";
