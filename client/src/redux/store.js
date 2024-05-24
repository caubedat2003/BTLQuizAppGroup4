import { configureStore } from "@reduxjs/toolkit";
import usersSlice from "./usersSlice";
import loaderSlice from "./loaderSlice";


const store = configureStore({
    reducer: {
        users: usersSlice,
        loader: loaderSlice,
    }
});

export default store;