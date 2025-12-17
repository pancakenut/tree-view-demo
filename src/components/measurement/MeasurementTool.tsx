import { Layer, Marker, useMap, Source } from "react-map-gl/mapbox";
import type { LayerProps } from "react-map-gl/mapbox";
import type { FeatureCollection, LineString } from "geojson";

const geojson: FeatureCollection<LineString> = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          [
            114.29747863235701,
            30.59377993447046
          ],
          [
            114.29998205545189,
            30.59227647643688
          ],
          [
            114.3021070541231,
            30.59377993447046
          ]
        ],
        "type": "LineString"
      }
    }
  ]
}

const lineLayer: LayerProps = {
  id: 'line',
  type: 'line',
  paint: {
    'line-color': '#4E3FC8',
    'line-width': 4
  }
};


function MeasurementTool() {

  return (
    <>
    {
        geojson.features[0].geometry.coordinates.map((coord, idx) => (
            <Marker 
                key={`marker-${idx}`} 
                longitude={coord[0]} 
                latitude={coord[1]} 
                anchor="center"
            >
                <div className="size-4 rounded-full bg-red-500 border border-white shadow-sm" />
            </Marker>
        ))
    }

    <Source id="line-source" type="geojson" data={geojson}>
        <Layer {...lineLayer} />
    </Source>
    </>
  )
}

export default MeasurementTool


