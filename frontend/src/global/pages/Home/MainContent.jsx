import React, { useState } from "react";
import ListingsPage from "../../../modules/listings/pages/ListingsPage/ListingsPage";


export default function MainContent({activeContent}) {

  const viewsContent = {
    listingsPage: <ListingsPage/>
  }

  const actualContent = viewsContent[activeContent];

  return (
    actualContent
  );
}
