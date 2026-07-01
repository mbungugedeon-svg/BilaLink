// js/data/provinces.js
// Géographie de référence : provinces, villes, coordonnées GPS pour la carte.

export const PROVINCES = ["Kinshasa", "Kongo Central", "Kwilu", "Kwango", "Tshopo", "Haut-Katanga", "Kasaï", "Nord-Kivu"];

export const CITIES = {
  "Kinshasa": ["Maluku", "Nsele", "Kimbanseke", "Gombe"],
  "Kongo Central": ["Matadi", "Boma", "Mbanza-Ngungu", "Kisantu"],
  "Kwilu": ["Kikwit", "Bandundu", "Idiofa"],
  "Kwango": ["Kenge", "Popokabaka"],
  "Tshopo": ["Kisangani", "Yangambi"],
  "Haut-Katanga": ["Lubumbashi", "Likasi", "Kasumbalesa"],
  "Kasaï": ["Tshikapa", "Ilebo"],
  "Nord-Kivu": ["Goma", "Beni", "Butembo"],
};

// Coordonnées [latitude, longitude] utilisées par la carte (Leaflet).
export const COORDS = {
  "Maluku": [-4.06, 16.08], "Nsele": [-4.36, 15.49], "Kimbanseke": [-4.45, 15.41], "Gombe": [-4.31, 15.31],
  "Mbanza-Ngungu": [-5.25, 14.86], "Matadi": [-5.82, 13.47], "Boma": [-5.85, 13.05], "Kisantu": [-5.13, 15.09],
  "Kikwit": [-5.04, 18.82], "Bandundu": [-3.32, 17.38], "Kisangani": [0.52, 25.19], "Yangambi": [0.77, 24.43],
  "Lubumbashi": [-11.66, 27.48], "Likasi": [-10.98, 26.73], "Tshikapa": [-6.42, 20.79], "Goma": [-1.66, 29.22],
};

// Coordonnée de repli si une ville n'a pas encore d'entrée dans COORDS (centre RDC approx.).
export const DEFAULT_COORDS = [-4.32, 15.31];
