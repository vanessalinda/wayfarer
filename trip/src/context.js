import React, { useState, useContext, useEffect } from "react";
import Cookies from "universal-cookie";
import axios from "axios";
import { getUserFromUsers } from "./helpers/selectors";

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const cookies = new Cookies();

  //Setting up global app state
  const [state, setState] = useState({
    trips: [],
    users: [],
    activities: [],
    user: cookies.get("user_id"),
    tripId: "",
    trip: {},
  });
  const [userTrips, setUserTrips] = useState([]);

  // Calling all the data and setting application state
  useEffect(() => {
    Promise.all([
      axios.get("/api/trips"),
      axios.get("/api/users"),
      axios.get("/api/activities"),
    ]).then(([trips, users, activities]) => {
      setState((prev) => ({
        ...prev,
        trips: trips.data.trips,
        users: users.data.users,
        activities: activities.data.activities,
      }));
      setUserTrips([...trips.data.trips]);
    });
  }, []);

  //////// User Functionality ////////

  //Login function
  const login = () => {
    cookies.set("user_id", 1, { path: "/" });
    setState((prev) => ({
      ...prev,
      user: cookies.get("user_id"),
    }));
  };

  //Logout function
  const logout = () => {
    cookies.remove("user_id", { path: "/" });
    setState((prev) => ({
      ...prev,
      user: "",
    }));
  };

  // Logged In User
  const loggedUser = getUserFromUsers(state.users, state.user);

  return (
    <AppContext.Provider
      value={{
        state,
        login,
        logout,
        loggedUser,
        userTrips,
        setUserTrips,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
// make sure use
export const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppContext, AppProvider };
