import { Injectable } from '@nestjs/common';

interface Point {
  lat: number;
  lng: number;
  [key: string]: any;
}

export interface OptimizedStop extends Point {
  distanceFromPrevious: number;
  distanceFromStart: number;
}

export interface OptimizationResult {
  stops: OptimizedStop[];
  totalDistance: number;
}

@Injectable()
export class OptimizationService {
  optimize(start: Point, destinations: Point[]): OptimizationResult {
    if (destinations.length === 0) {
      return { stops: [], totalDistance: 0 };
    }

    if (destinations.length === 1) {
      const dist = this.haversineDistance(start, destinations[0]);
      return {
        stops: [{ ...destinations[0], distanceFromPrevious: dist, distanceFromStart: dist }],
        totalDistance: dist,
      };
    }

    // Nearest Neighbor algorithm
    const remaining = [...destinations];
    const ordered: OptimizedStop[] = [];
    let current = start;
    let totalDistance = 0;

    while (remaining.length > 0) {
      let nearestIndex = 0;
      let nearestDist = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const dist = this.haversineDistance(current, remaining[i]);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIndex = i;
        }
      }

      const nearest = remaining[nearestIndex];
      const distFromStart = this.haversineDistance(start, nearest);

      ordered.push({
        ...nearest,
        distanceFromPrevious: nearestDist,
        distanceFromStart: distFromStart,
      });

      totalDistance += nearestDist;
      current = nearest;
      remaining.splice(nearestIndex, 1);
    }

    return { stops: ordered, totalDistance: Math.round(totalDistance * 100) / 100 };
  }

  haversineDistance(a: Point, b: Point): number {
    const R = 6371;
    const dLat = this.toRad(b.lat - a.lat);
    const dLon = this.toRad(b.lng - a.lng);
    const lat1 = this.toRad(a.lat);
    const lat2 = this.toRad(b.lat);

    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const aCalc =
      sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));

    return R * c;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  calculateEstimatedTime(distanceKm: number): number {
    return Math.round(distanceKm * 2);
  }
}
