// Dotted map of Africa + Türkiye, generated at build time: the page ships two small <path>s and no map JS.
// Outlines are rough [lon, lat] polygons. A dot is drawn at every grid point that falls inside one,
// as a zero-length subpath (`h0`) that `stroke-linecap: round` turns into a circle.

type Point = [number, number]; // [lon, lat]

const LON0 = -20; // map x = lon - LON0, map y = LAT0 - lat (equirectangular)
const LAT0 = 44;
const STEP = 1.3; // grid spacing in degrees (= map units)

export const MAP_VIEWBOX = '0 0 75 81';

const africa: Point[] = [[-5.8,35.8],[-2,35.1],[1,36.5],[5,36.8],[8.6,36.9],[10.2,37.2],[11.1,36.9],[10.5,36],[11.1,35.2],[10.1,34.3],[11.3,33.1],[12.5,32.8],[15.2,32.3],[15.6,31.5],[18.5,30.4],[20.1,30.9],[20.1,32.2],[21.6,32.9],[23.1,32.6],[25.2,31.6],[27.5,31.3],[29.9,31.3],[32.3,31.3],[32.6,29.9],[33.6,28],[34.5,26.5],[35.6,24],[36.9,22],[37.4,19],[38.6,17.5],[39.4,15.6],[41.2,14],[43.3,12.6],[43.1,11.6],[44.5,10.4],[47,11.1],[49,11.3],[51.3,11.8],[51.1,10.4],[50.3,8.2],[48.7,5],[47,3],[45.3,2],[43.5,0.5],[42.5,-0.4],[41,-2],[39.7,-4],[39.3,-6.8],[39.5,-8.5],[40.4,-10.7],[40.6,-14.5],[40,-16.2],[36.9,-17.9],[34.9,-19.8],[35.4,-22],[35.5,-24],[32.9,-25.9],[32.6,-27.5],[31,-29.9],[28,-32.8],[25.6,-34],[22.5,-34],[20,-34.8],[18.4,-34.2],[18.2,-32],[17,-29],[15.2,-27],[14.5,-23],[13,-20],[11.8,-17],[12.1,-15.2],[13.6,-12],[13.2,-8.8],[12.3,-6],[11.8,-4.5],[9.5,-2],[9.4,0.4],[9.6,3],[9.7,4],[8.5,4.5],[6,4.3],[4.5,6.3],[3.4,6.4],[1,6],[-0.2,5.6],[-2,4.8],[-4,5.2],[-7.7,4.4],[-10.8,6.3],[-12.5,7.5],[-13.2,8.5],[-13.7,9.5],[-15,10.8],[-15.6,11.9],[-16.7,12.5],[-17.4,14.7],[-16.5,16],[-16,18],[-16.3,19.5],[-17,21],[-15.8,23.7],[-14.5,26.1],[-13,27.6],[-11.5,28.2],[-9.8,29.6],[-9.6,30.4],[-9.8,31.5],[-8.5,33.2],[-7.6,33.6],[-6.8,34],[-6.2,35.2]];
const madagascar: Point[] = [[49.3,-12],[50.2,-15.5],[49.6,-17],[48,-22],[47,-25],[45.2,-25.6],[43.7,-23.5],[43.4,-21.5],[44.4,-19.5],[44,-17],[46.3,-15.7],[48,-13.6]];
const turkey: Point[] = [[26,41.8],[28,41.6],[29.1,41.2],[31.4,41.2],[33.5,42],[35.2,42],[36.5,41.3],[38.5,40.9],[40.5,41],[41.5,41.5],[43.4,41.1],[44.8,39.7],[44.4,38.4],[44.3,37.2],[42.4,37.1],[40,36.8],[38,36.8],[36.6,36.2],[36,35.9],[35.8,36.8],[34.6,36.8],[32.8,36],[30.6,36.8],[29.6,36.2],[28,36.7],[27.3,37.2],[26.3,38.3],[26.7,39.4],[26.2,40],[26,40.6]];

// Supply routes: from a hub in Ankara to a few illustrative points across Africa (decorative, not a country list).
const hub: Point = [32.9, 39.9];
const targets: Point[] = [[-1.5, 7.5], [-11.5, 10.5], [27.5, -11.5], [28, -26], [36.5, -3], [3, 33]];

// Ray casting: is `pt` inside polygon `poly`?
const inside = (pt: Point, poly: Point[]): boolean => {
  let isIn = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) isIn = !isIn;
  }
  return isIn;
};

const round = (n: number): number => Math.round(n * 100) / 100;
const toX = (lon: number): number => round(lon - LON0);
const toY = (lat: number): number => round(LAT0 - lat);

export interface MapData {
  africa: string; // path data, one dot per subpath
  turkey: string;
  arcs: { d: string; delay: number }[];
  pins: { x: number; y: number; delay: number }[];
  hub: { x: number; y: number };
}

export function buildMap(): MapData {
  const africaDots: string[] = [];
  const turkeyDots: string[] = [];

  // Grid indices (not accumulated floats) keep the coordinates clean.
  for (let j = 0; 43 - STEP * j > -37; j++) {
    const lat = 43 - STEP * j;
    let lastAfrica = -2; // column of the previous dot in this row: consecutive dots use a short relative move
    let lastTurkey = -2;
    for (let k = 0; -19 + STEP * k < 55; k++) {
      const lon = -19 + STEP * k;
      const pt: Point = [lon, lat];
      const start = `M${toX(lon)} ${toY(lat)}h0`;
      if (inside(pt, turkey)) {
        turkeyDots.push(k === lastTurkey + 1 ? `m${STEP} 0h0` : start);
        lastTurkey = k;
      } else if (inside(pt, africa) || inside(pt, madagascar)) {
        africaDots.push(k === lastAfrica + 1 ? `m${STEP} 0h0` : start);
        lastAfrica = k;
      }
    }
  }

  const [hx, hy] = [toX(hub[0]), toY(hub[1])];
  const arcs: MapData['arcs'] = [];
  const pins: MapData['pins'] = [];
  targets.forEach(([lon, lat], i) => {
    const [x2, y2] = [toX(lon), toY(lat)];
    const [dx, dy] = [x2 - hx, y2 - hy];
    const len = Math.hypot(dx, dy);
    const bend = len * 0.22;
    const cx = (hx + x2) / 2 - (dy / len) * bend; // control point: the arc bows to one side
    const cy = (hy + y2) / 2 + (dx / len) * bend;
    arcs.push({ d: `M${hx} ${hy}Q${round(cx)} ${round(cy)} ${x2} ${y2}`, delay: -i * 0.5 });
    pins.push({ x: x2, y: y2, delay: i * 0.4 });
  });

  return { africa: africaDots.join(''), turkey: turkeyDots.join(''), arcs, pins, hub: { x: hx, y: hy } };
}
