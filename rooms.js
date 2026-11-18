// ROOM LIST. Replace the placeholder rooms with the real ones from your JPEG.
// Each room: { no: "room number (must be unique)", cap: max people }
// Floors are listed from the ground floor up.
const mk = (floor, nos, cap = 3) => ({ label: "Floor " + floor, rooms: nos.map(n => ({ no: String(n), cap })) });

window.ROOMS = {
  front: { name: "Front",  floors: [
    mk(1, [101,102,103,104,105,106]),
    mk(2, [201,202,203,204,205,206]),
    mk(3, [301,302,303,304,305,306]),
    mk(4, [401,402,403,404,405,406])
  ]},
  middle: { name: "Middle", floors: [
    mk(1, [111,112,113,114,115]),
    mk(2, [211,212,213,214,215]),
    mk(3, [311,312,313,314,315])
  ]},
  rear: { name: "Rear", floors: [
    mk(1, [121,122,123,124]),
    mk(2, [221,222,223,224])
  ]}
};
