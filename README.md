# Attendance Tracker

_Attendance Tracker_ is a full-stack web app for workers to check in and out at worksites, catering for different user roles:
- _Worker:_ Can check in or out. Geolocation is used to confirm that they are within the worksite area.
- _Manager:_ Can view check in logs and a dashboard of workers' locations and past attendance.
- _Admin:_ Can assign user roles and add, remove, or edit worksites on an interactive map.

This app was built by [Kwan Siong](https://github.com/KwanSiong007) and [Cheng Wai](https://github.com/chengwaikoo) as [Project 2](https://bootcamp.rocketacademy.co/2-full-stack/2.p-full-stack-app-firebase) for the [Rocket Academy Coding Bootcamp](https://www.rocketacademy.co/courses/coding-bootcamp).

Try it out [**here**](https://kwansiong007.github.io/Attendance-tracking-app/)! Click on "Register" to create a worker account.

## Technologies Used

- React with [Create React App](https://create-react-app.dev/)
- [Firebase](https://firebase.google.com/products-build) Realtime Database, Storage, and Authentication
- [Geolocation Web API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Nivo](https://nivo.rocks/) for data visualisation
- [Mapbox GL JS](https://www.mapbox.com/mapbox-gljs) and [Mapbox Draw](https://github.com/mapbox/mapbox-gl-draw) for interactive map
- [Material UI](https://mui.com/material-ui/) for UI components
- [Turf](https://turfjs.org/) for distance calculation
- [date-fns](https://date-fns.org/) for date manipulation
