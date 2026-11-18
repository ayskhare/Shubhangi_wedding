// ROOM LIST (from the room sheet). Each room: [room number, max people].
// Room numbers must be unique. Floors are listed from the ground floor up.
const f = (label, rooms) => ({ label, rooms: rooms.map(([no, cap]) => ({ no: String(no), cap })) });

window.ROOMS = {
  front: { name: "Front", floors: [
    f("Ground Floor", [[101,3],[102,3],[103,3],[104,3],[105,6]]),
    f("1st Floor",    [[106,6],[107,3],[108,3],[109,3],[110,6]]),
    f("2nd Floor",    [[111,6],[112,3],[113,3],[114,3],[115,6]]),
    f("3rd Floor",    [[116,6],[117,3],[118,3],[119,3],[120,6]])
  ]},
  middle: { name: "Middle", floors: [   // Ground floor (AC Banquet Hall) is not shown
    f("2nd Floor", [[201,2],[202,2],[203,2],[204,2],[205,3],[206,3],[207,2],[208,2],["Dorm",20]]),
    f("3rd Floor", [[209,4],[210,4],[211,2],[212,2],[213,2],[214,2],[215,3],[216,3],[217,2],[218,2],[219,2],[220,2]])
  ]},
  rear: { name: "Rear", floors: [
    f("Ground Floor", [[301,6],[302,3],[303,3],[304,3],[305,3],[306,6]]),
    f("1st Floor",    [[307,6],[308,3],[309,3],[310,3],[311,3],[312,6]])
  ]}
};
