// BG.MSS CONTENTS
// - Background
// - Land
// - Waterways, waterareas
// - Aeroways
// - Buildings
// - Barriers
// - Administrative Boundaries

// =====================================================================
// WATER AREAS
// =====================================================================

#water {
  polygon-fill: @water;
  polygon-gamma: 0.75;
}

// =====================================================================
// WATER WAYS
// =====================================================================

#waterway[zoom>=8][zoom<=11],
#waterway[class='river'][zoom>=12],
#waterway[class='canal'][zoom>=12] {
  line-color: @water;
  [zoom=8] { line-width: 0.1; }
  [zoom=9] { line-width: 0.2; }
  [zoom=10] { line-width: 0.4; }
  [zoom=11] { line-width: 0.6; }
  [zoom=12]{ line-width: 0.8; }
  [zoom=13]{ line-width: 1; }
  [zoom>12]{
    line-cap: round;
    line-join: round;
  }
  [zoom=14]{ line-width: 1.5; }
  [zoom=15]{ line-width: 2; }
  [zoom=16]{ line-width: 3; }
  [zoom=17]{ line-width: 4; }
  [zoom=18]{ line-width: 5; }
  [zoom=19]{ line-width: 6; }
  [zoom>19]{ line-width: 7; }
}

#waterway[class='stream'][zoom>=13],
#waterway[class='stream_intermittent'][zoom>=13] {
  line-color: @water;
  [zoom=13]{ line-width: 0.2; }
  [zoom=14]{ line-width: 0.4; }
  [zoom=15]{ line-width: 0.6; }
  [zoom=16]{ line-width: 0.8; }
  [zoom=17]{ line-width: 1; }
  [zoom=18]{ line-width: 1.5; }
  [zoom=19]{ line-width: 2; }
  [zoom>19]{ line-width: 2.5; }
  [class='stream_intermittent'] {
    [zoom>=13] { line-dasharray:20,3,2,3,2,3,2,3; }
    [zoom>=15] { line-dasharray:30,6,4,6,4,6,4,6; }
    [zoom>=18] { line-dasharray:40,9,6,9,6,9,6,9; }
  }
}

#waterway[class='ditch'][zoom>=15],
#waterway[class='drain'][zoom>=15] {
  line-color: @water;
  [zoom=15]{ line-width: 0.1; }
  [zoom=16]{ line-width: 0.3; }
  [zoom=17]{ line-width: 0.5; }
  [zoom=18]{ line-width: 0.7; }
  [zoom=19]{ line-width: 1; }
  [zoom>19]{ line-width: 1.5; }
}
