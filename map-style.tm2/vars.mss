// *********************************************************************
// MAPBOX STREETS
// *********************************************************************

// =====================================================================
// FONTS
// =====================================================================

// Language
@name: '[name]';

// set up font sets for various weights and styles
@sans_lt:           "Open Sans Regular","Arial Unicode MS Regular";
@sans_lt_italic:    "Open Sans Italic","Arial Unicode MS Regular";
@sans:              "Open Sans Semibold","Arial Unicode MS Regular";
@sans_bold:         "Open Sans Bold","Arial Unicode MS Regular";
@sans_italic:       "Open Sans Semibold Italic","Arial Unicode MS Regular";
@sans_bold_italic:  "Open Sans Bold Italic","Arial Unicode MS Regular";

// =====================================================================
// LANDUSE & LANDCOVER COLORS
// =====================================================================

@water:  rgba(255, 255, 255, 0.4);

// =====================================================================
// ROAD COLORS
// =====================================================================

// For each class of road there are three color variables:
// - line: for lower zoomlevels when the road is represented by a
//         single solid line.
// - case: for higher zoomlevels, this color is for the road's
//         casing (outline).
// - fill: for higher zoomlevels, this color is for the road's
//         inner fill (inline).

@motorway_line:     #fff;
@motorway_fill:     #fff;
@motorway_case:     #000;

@main_line:     #fff;
@main_fill:     #fff;
@main_case:     #000;

@road_line:     #fff;
@road_fill:     #fff;
@road_case:     #000;

@pedestrian_line:   #fff;
@pedestrian_fill:   @pedestrian_line;
@pedestrian_case:   @road_case;

@path_line:     #fff;
@path_fill:     #fff;
@path_case:     @land;

@rail_line:     #aaa;
@rail_fill:     #fff;
@rail_case:     @land;

@bridge_case:   #999;

@aeroway:       lighten(@industrial,5);

// =====================================================================
// BOUNDARY COLORS
// =====================================================================

@admin_2:           #234;
@admin_3:           #345;
@admin_4:           #345;

// =====================================================================
// LABEL COLORS
// =====================================================================

// We set up a default halo color for places so you can edit them all
// at once or override each individually.
@place_halo:        #fff;

@country_text:      black * 0.2;
@country_halo:      @place_halo;

@state_text:        #666;
@state_halo:        @place_halo;

@city_text:         black * 0.1;
@city_halo:         @place_halo;

@town_text:         black * 0.2;
@town_halo:         @place_halo;

@poi_text:          @poi_text;  

@road_text:         #666;
@road_halo:         #fff;

@other_text:        darken(black,50)*0.8;
@other_halo:        @place_halo;

@locality_text:     #aaa;
@locality_halo:     @land;

// Also used for other small places: hamlets, suburbs, localities
@village_text:      #888;
@village_halo:      @place_halo;

@transport_text:    #445;

/**/