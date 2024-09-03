import React, { useState, useEffect } from "react";
import { BiSolidUserCircle, BiUser } from "react-icons/bi";

const ModelSelector = ({ selectedModel, setSelectedModel }) => {
  useEffect(() => {
    // Load saved model from local storage if it exists
    const savedModel = localStorage.getItem("model");
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  const handleModelChange = (event) => {
    const model = event.target.value;
    setSelectedModel(model);
    localStorage.setItem("model", model);
  };

  return (
    <>
      <div className="sidebar-info-model">
        {/* <BiSolidUserCircle size={20} /> */}
        <p>Model</p>
        <select
          name="model"
          id="model"
          value={selectedModel}
          onChange={handleModelChange}
          style={{ color: "black" }}
        >
          <option style={{ color: "black" }} value="gpt-3.5-turbo-16k-0613">
            gpt-3.5-turbo-16k-0613
          </option>
          <option style={{ color: "black" }} value="gpt-3.5-turbo-0125">
            gpt-3.5-turbo-0125
          </option>
          {/* Add more options as needed */}
        </select>
      </div>
    </>
  );
};

export default ModelSelector;
