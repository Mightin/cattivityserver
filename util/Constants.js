/**
 * Created by Martin on 12-12-2015.
 */

var phones = [
    {place: "Kitchen", id: 0, x: 230, y: 175},
    {place: "Livingroom", id: 1, x: 700, y: 80},
    {place: "Bedroom", id: 2, x: 560, y: 530}
];

var locations = [
    {place: "Food Bowl", placeID: 1, x: 64, y: 106},
    {place: "Kitchen Hood", placeID: 2, x: 208, y: 198},
    {place: "Kitchen Table", placeID: 3, x: 58, y: 286},
    {place: "Kitchen Shelves", placeID: 4, x: 66, y: 350},
    {place: "Kitchen Closet", placeID: 5, x: 218, y: 344},
    {place: "Bathroom Litterbox", placeID: 6, x: 328, y: 182},
    {place: "Bathroom Sink", placeID: 7, x: 420, y: 106},
    {place: "Hall, By Livingroom", placeID: 8, x: 420, y: 282},
    {place: "Hall Door", placeID: 9, x: 376, y: 342},
    {place: "Sofa (Left Top)", placeID: 10, x: 474, y: 64},
    {place: "Sofa (Middle Top)", placeID: 11, x: 542, y: 62},
    {place: "Sofa (Right Top)", placeID: 12, x: 614, y: 66},
    {place: "Sofa (Right Middle)", placeID: 13, x: 614, y: 122},
    {place: "Sofa (Right Bottom)", placeID: 14, x: 614, y: 186},
    {place: "Computer", placeID: 15, x: 696, y: 76},
    {place: "Printer", placeID: 16, x: 764, y: 94},
    {place: "Cupboard (Left)", placeID: 17, x: 660, y: 316},
    {place: "Living room", placeID: 18, x: 542, y: 318},
    {place: "Cupboard (Right)", placeID: 19, x: 742, y: 346},
    {place: "Terrace, Computer Chair", placeID: 20, x: 846, y: 80},
    {place: "Terrace, Chair (Top)", placeID: 21, x: 874, y: 176},
    {place: "Terrace, play", placeID: 22, x: 944, y: 318},
    {place: "Bedroom, Cupboard", placeID: 23, x: 502, y: 398},
    {place: "Bedroom, Bed (Top Left)", placeID: 24, x: 650, y: 448},
    {place: "Bedroom, Bed (Bottom Left)", placeID: 25, x: 650, y: 502},
    {place: "Bedroom, Bed (Middle Right)", placeID: 26, x: 736, y: 474},
    {place: "Bedroom, Night Table", placeID: 27, x: 800, y: 400},
    {place: "Bedroom, Windowsill", placeID: 28, x: 816, y: 458},
    {place: "Hall, By Shoes", placeID: 29, x: 292, y: 358},
    {place: "Bedroom, Closet", placeID: 30, x: 464, y: 520},

    {place: "Livingroom 0,0", placeID: 47, x: 543, y: 287},
    {place: "Livingroom 1,0", placeID: 48, x: 631, y: 287},
    {place: "Livingroom 2,0", placeID: 49, x: 719, y: 287},

    {place: "Livingroom 0,1", placeID: 50, x: 543, y: 199},
    {place: "Livingroom 1,1", placeID: 51, x: 631, y: 199},
    {place: "Livingroom 2,1", placeID: 52, x: 719, y: 199},

    {place: "Livingroom 0,2", placeID: 53, x: 543, y: 111},
    {place: "Livingroom 1,2", placeID: 54, x: 631, y: 111},
    {place: "Livingroom 2,2", placeID: 55, x: 719, y: 111},

    {place: "Entrance 0,0", placeID: 56, x: 356, y: 287},
    {place: "Bathroom 0,0", placeID: 57, x: 356, y: 199},
    {place: "Bathroom 0,1", placeID: 58, x: 356, y: 111},

    {place: "Kitchen 0,0", placeID: 59, x: 104, y: 287},
    {place: "Kitchen 1,0", placeID: 60, x: 192, y: 287},

    {place: "Kitchen 0,1", placeID: 61, x: 104, y: 199},
    {place: "Kitchen 1,1", placeID: 62, x: 192, y: 199},

    {place: "Kitchen 0,2", placeID: 63, x: 104, y: 111},
    {place: "Kitchen 1,2", placeID: 64, x: 192, y: 111},

    {place: "Balcony 0,0", placeID: 65, x: 888, y: 287},
    {place: "Balcony 0,1", placeID: 66, x: 888, y: 199},
    {place: "Balcony 0,2", placeID: 67, x: 888, y: 111},

    {place: "Bedroom 0,0", placeID: 68, x: 543, y: 469},
    {place: "Bedroom 1,0", placeID: 69, x: 631, y: 469},
    {place: "Bedroom 2,0", placeID: 70, x: 719, y: 469},
    {place: "Bedroom 3,0", placeID: 71, x: 807, y: 469}
];

var phonesForBaseline = [
    {place: "TV", id: 0, x: 510, y: 207},
    {place: "Comp", id: 1, x: 722, y: 131},
    {place: "Corner", id: 2, x: 722, y: 330}
];

var locationsForBaseline = [
    {place: "0,0", placeID: 31, x: 574, y: 330},
    {place: "1,0", placeID: 32, x: 623, y: 330},
    {place: "2,0", placeID: 33, x: 673, y: 330},
    {place: "3,0", placeID: 34, x: 722, y: 330},

    {place: "0,1", placeID: 35, x: 574, y: 281},
    {place: "1,1", placeID: 36, x: 623, y: 281},
    {place: "2,1", placeID: 37, x: 673, y: 281},
    {place: "3,1", placeID: 38, x: 722, y: 281},

    {place: "0,2", placeID: 39, x: 574, y: 231},
    {place: "1,2", placeID: 40, x: 623, y: 231},
    {place: "2,2", placeID: 41, x: 673, y: 231},
    {place: "3,2", placeID: 42, x: 722, y: 231},

    {place: "0,3", placeID: 43, x: 574, y: 182},
    {place: "1,3", placeID: 44, x: 623, y: 182},
    {place: "2,3", placeID: 45, x: 673, y: 182},
    {place: "3,3", placeID: 46, x: 722, y: 182}
]

module.exports = module.exports = {
    phones: phones,
    locations: locations,
    phonesForBaseline: phonesForBaseline,
    locationsForBaseline: locationsForBaseline
};