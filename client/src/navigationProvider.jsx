import React, { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";

// Create a context for navigation
const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const navigate = useNavigate(); // access the useNavigate hook here

  return (
    <NavigationContext.Provider value={{ navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

// Custom hook to access the navigation context
export const useNavigation = () => useContext(NavigationContext);
