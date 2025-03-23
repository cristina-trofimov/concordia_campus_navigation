/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CoordsProvider, useCoords } from '../src/data/CoordsContext';
import { IndoorsProvider, useIndoor } from '../src/data/IndoorContext';
import { BuildingFloorAssociation } from '../src/interfaces/buildingFloorAssociation';

// Test component for CoordsContext
const TestCoordsComponent = () => {
  const {
    routeData, 
    setRouteData,
    isInsideBuilding, 
    setIsInsideBuilding,
    myLocationString, 
    setmyLocationString,
    isTransit, 
    setIsTransit,
    highlightedBuilding, 
    setHighlightedBuilding,
    myLocationCoords, 
    setMyLocationCoords
  } = useCoords();

  return (
    <div>
      <button data-testid="set-route-data" onClick={() => setRouteData({ test: 'route' })}>Set Route Data</button>
      <button data-testid="set-inside-building" onClick={() => setIsInsideBuilding(true)}>Set Inside Building</button>
      <button data-testid="set-location-string" onClick={() => setmyLocationString("Hall Building")}>Set Location String</button>
      <button data-testid="set-is-transit" onClick={() => setIsTransit(true)}>Set Is Transit</button>
      <button data-testid="set-highlighted-building" onClick={() => setHighlightedBuilding({ properties: { id: 'hall' } })}>Set Highlighted Building</button>
      <button data-testid="set-location-coords" onClick={() => setMyLocationCoords({ latitude: 45.497, longitude: -73.578 })}>Set Location Coords</button>
      
      <div data-testid="route-data">{JSON.stringify(routeData)}</div>
      <div data-testid="is-inside-building">{isInsideBuilding.toString()}</div>
      <div data-testid="location-string">{myLocationString}</div>
      <div data-testid="is-transit">{isTransit.toString()}</div>
      <div data-testid="highlighted-building">{JSON.stringify(highlightedBuilding)}</div>
      <div data-testid="location-coords">{JSON.stringify(myLocationCoords)}</div>
    </div>
  );
};

// Test component for IndoorContext
const TestIndoorComponent = () => {
  const {
    buildingHasFloors,
    setBuildingHasFloors,
    inFloorView,
    setInFloorView,
    currentFloor,
    setCurrentFloor,
    floorList,
    setFloorList,
    currentFloorAssociations,
    setCurrentFloorAssociations,
    indoorFeatures,
    setIndoorFeatures
  } = useIndoor();

  return (
    <div>
      <button data-testid="set-building-has-floors" onClick={() => setBuildingHasFloors(true)}>Set Building Has Floors</button>
      <button data-testid="set-in-floor-view" onClick={() => setInFloorView(true)}>Set In Floor View</button>
      <button data-testid="set-current-floor" onClick={() => setCurrentFloor("1st Floor")}>Set Current Floor</button>
      <button data-testid="set-floor-list" onClick={() => setFloorList(["1st Floor", "2nd Floor"])}>Set Floor List</button>
      <button 
        data-testid="set-floor-associations" 
        onClick={() => setCurrentFloorAssociations([{ buildingID: 'hall', floor: '1', component: 'h1Features' }])}>
        Set Floor Associations
      </button>
      <button 
        data-testid="set-indoor-features" 
        onClick={() => setIndoorFeatures([{ type: 'Feature', properties: { ref: 'H-101' } }])}>
        Set Indoor Features
      </button>
      
      <div data-testid="building-has-floors">{buildingHasFloors.toString()}</div>
      <div data-testid="in-floor-view">{inFloorView.toString()}</div>
      <div data-testid="current-floor">{currentFloor || 'null'}</div>
      <div data-testid="floor-list">{JSON.stringify(floorList)}</div>
      <div data-testid="floor-associations">{JSON.stringify(currentFloorAssociations)}</div>
      <div data-testid="indoor-features">{JSON.stringify(indoorFeatures)}</div>
    </div>
  );
};

describe('CoordsContext', () => {
  test('provides default values', () => {
    render(
      <CoordsProvider>
        <TestCoordsComponent />
      </CoordsProvider>
    );
    
    expect(screen.getByTestId('route-data')).toHaveTextContent('null');
    expect(screen.getByTestId('is-inside-building')).toHaveTextContent('false');
    expect(screen.getByTestId('location-string')).toHaveTextContent('');
    expect(screen.getByTestId('is-transit')).toHaveTextContent('false');
    expect(screen.getByTestId('highlighted-building')).toHaveTextContent('null');
    expect(screen.getByTestId('location-coords')).toHaveTextContent('null');
  });

  test('updates routeData state correctly', () => {
    render(
      <CoordsProvider>
        <TestCoordsComponent />
      </CoordsProvider>
    );
    
    act(() => {
      screen.getByTestId('set-route-data').click();
    });
    
    expect(screen.getByTestId('route-data')).toHaveTextContent('{"test":"route"}');
  });

  test('updates isInsideBuilding state correctly', () => {
    render(
      <CoordsProvider>
        <TestCoordsComponent />
      </CoordsProvider>
    );
    
    act(() => {
      screen.getByTestId('set-inside-building').click();
    });
    
    expect(screen.getByTestId('is-inside-building')).toHaveTextContent('true');
  });

  test('updates myLocationString state correctly', () => {
    render(
      <CoordsProvider>
        <TestCoordsComponent />
      </CoordsProvider>
    );
    
    act(() => {
      screen.getByTestId('set-location-string').click();
    });
    
    expect(screen.getByTestId('location-string')).toHaveTextContent('Hall Building');
  });

  test('updates isTransit state correctly', () => {
    render(
      <CoordsProvider>
        <TestCoordsComponent />
      </CoordsProvider>
    );
    
    act(() => {
      screen.getByTestId('set-is-transit').click();
    });
    
    expect(screen.getByTestId('is-transit')).toHaveTextContent('true');
  });

  test('updates highlightedBuilding state correctly', () => {
    render(
      <CoordsProvider>
        <TestCoordsComponent />
      </CoordsProvider>
    );
    
    act(() => {
      screen.getByTestId('set-highlighted-building').click();
    });
    
    expect(screen.getByTestId('highlighted-building')).toHaveTextContent('{"properties":{"id":"hall"}}');
  });

  test('updates myLocationCoords state correctly', () => {
    render(
      <CoordsProvider>
        <TestCoordsComponent />
      </CoordsProvider>
    );
    
    act(() => {
      screen.getByTestId('set-location-coords').click();
    });
    
    expect(screen.getByTestId('location-coords')).toHaveTextContent('{"latitude":45.497,"longitude":-73.578}');
  });

  test('provides updated context value when state changes', () => {
    render(
      <CoordsProvider>
        <TestCoordsComponent />
      </CoordsProvider>
    );
    
    act(() => {
      screen.getByTestId('set-route-data').click();
      screen.getByTestId('set-inside-building').click();
      screen.getByTestId('set-location-string').click();
      screen.getByTestId('set-is-transit').click();
      screen.getByTestId('set-highlighted-building').click();
      screen.getByTestId('set-location-coords').click();
    });
    
    expect(screen.getByTestId('route-data')).toHaveTextContent('{"test":"route"}');
    expect(screen.getByTestId('is-inside-building')).toHaveTextContent('true');
    expect(screen.getByTestId('location-string')).toHaveTextContent('Hall Building');
    expect(screen.getByTestId('is-transit')).toHaveTextContent('true');
    expect(screen.getByTestId('highlighted-building')).toHaveTextContent('{"properties":{"id":"hall"}}');
    expect(screen.getByTestId('location-coords')).toHaveTextContent('{"latitude":45.497,"longitude":-73.578}');
  });
});

describe('IndoorContext', () => {
  test('provides default values', () => {
    render(
      <IndoorsProvider>
        <TestIndoorComponent />
      </IndoorsProvider>
    );
    
    expect(screen.getByTestId('building-has-floors')).toHaveTextContent('false');
    expect(screen.getByTestId('in-floor-view')).toHaveTextContent('false');
    expect(screen.getByTestId('current-floor')).toHaveTextContent('null');
    expect(screen.getByTestId('floor-list')).toHaveTextContent('[]');
    expect(screen.getByTestId('floor-associations')).toHaveTextContent('[]');
    expect(screen.getByTestId('indoor-features')).toHaveTextContent('[]');
  });

  test('updates buildingHasFloors state correctly', () => {
    render(
      <IndoorsProvider>
        <TestIndoorComponent />
      </IndoorsProvider>
    );
    
    act(() => {
      screen.getByTestId('set-building-has-floors').click();
    });
    
    expect(screen.getByTestId('building-has-floors')).toHaveTextContent('true');
  });

  test('updates inFloorView state correctly', () => {
    render(
      <IndoorsProvider>
        <TestIndoorComponent />
      </IndoorsProvider>
    );
    
    act(() => {
      screen.getByTestId('set-in-floor-view').click();
    });
    
    expect(screen.getByTestId('in-floor-view')).toHaveTextContent('true');
  });

  test('updates currentFloor state correctly', () => {
    render(
      <IndoorsProvider>
        <TestIndoorComponent />
      </IndoorsProvider>
    );
    
    act(() => {
      screen.getByTestId('set-current-floor').click();
    });
    
    expect(screen.getByTestId('current-floor')).toHaveTextContent('1st Floor');
  });

  test('updates floorList state correctly', () => {
    render(
      <IndoorsProvider>
        <TestIndoorComponent />
      </IndoorsProvider>
    );
    
    act(() => {
      screen.getByTestId('set-floor-list').click();
    });
    
    expect(screen.getByTestId('floor-list')).toHaveTextContent('["1st Floor","2nd Floor"]');
  });

  test('updates currentFloorAssociations state correctly', () => {
    render(
      <IndoorsProvider>
        <TestIndoorComponent />
      </IndoorsProvider>
    );
    
    act(() => {
      screen.getByTestId('set-floor-associations').click();
    });
    
    expect(screen.getByTestId('floor-associations')).toHaveTextContent('[{"buildingID":"hall","floor":"1","component":"h1Features"}]');
  });

  test('updates indoorFeatures state correctly', () => {
    render(
      <IndoorsProvider>
        <TestIndoorComponent />
      </IndoorsProvider>
    );
    
    act(() => {
      screen.getByTestId('set-indoor-features').click();
    });
    
    expect(screen.getByTestId('indoor-features')).toHaveTextContent('[{"type":"Feature","properties":{"ref":"H-101"}}]');
  });

  test('provides updated context value when state changes', () => {
    render(
      <IndoorsProvider>
        <TestIndoorComponent />
      </IndoorsProvider>
    );
    
    act(() => {
      screen.getByTestId('set-building-has-floors').click();
      screen.getByTestId('set-in-floor-view').click();
      screen.getByTestId('set-current-floor').click();
      screen.getByTestId('set-floor-list').click();
      screen.getByTestId('set-floor-associations').click();
      screen.getByTestId('set-indoor-features').click();
    });
    
    expect(screen.getByTestId('building-has-floors')).toHaveTextContent('true');
    expect(screen.getByTestId('in-floor-view')).toHaveTextContent('true');
    expect(screen.getByTestId('current-floor')).toHaveTextContent('1st Floor');
    expect(screen.getByTestId('floor-list')).toHaveTextContent('["1st Floor","2nd Floor"]');
    expect(screen.getByTestId('floor-associations')).toHaveTextContent('[{"buildingID":"hall","floor":"1","component":"h1Features"}]');
    expect(screen.getByTestId('indoor-features')).toHaveTextContent('[{"type":"Feature","properties":{"ref":"H-101"}}]');
  });
});

// Test using both contexts together
describe('Context Integration', () => {
  const CombinedContextsComponent = () => {
    const { highlightedBuilding, setHighlightedBuilding } = useCoords();
    const { 
      currentFloorAssociations, 
      setCurrentFloorAssociations,
      setBuildingHasFloors
    } = useIndoor();
    
    // When highlightedBuilding changes, update currentFloorAssociations
    React.useEffect(() => {
      if (highlightedBuilding && highlightedBuilding.properties) {
        const buildingID = highlightedBuilding.properties.id;
        setCurrentFloorAssociations([
          { buildingID, floor: '1', component: 'h1Features' }
        ]);
        setBuildingHasFloors(true);
      }
    }, [highlightedBuilding]);
    
    return (
      <div>
        <button 
          data-testid="set-highlighted-building" 
          onClick={() => setHighlightedBuilding({ properties: { id: 'hall' } })}>
          Set Highlighted Building
        </button>
        <div data-testid="highlighted-building">{JSON.stringify(highlightedBuilding)}</div>
        <div data-testid="floor-associations">{JSON.stringify(currentFloorAssociations)}</div>
      </div>
    );
  };
  
  test('contexts work together properly', () => {
    render(
      <CoordsProvider>
        <IndoorsProvider>
          <CombinedContextsComponent />
        </IndoorsProvider>
      </CoordsProvider>
    );
    
    // Check initial states
    expect(screen.getByTestId('highlighted-building')).toHaveTextContent('null');
    expect(screen.getByTestId('floor-associations')).toHaveTextContent('[]');
    
    // Trigger state change
    act(() => {
      screen.getByTestId('set-highlighted-building').click();
    });
    
    // Check updated states reflecting integration between contexts
    expect(screen.getByTestId('highlighted-building')).toHaveTextContent('{"properties":{"id":"hall"}}');
    expect(screen.getByTestId('floor-associations')).toHaveTextContent('[{"buildingID":"hall","floor":"1","component":"h1Features"}]');
  });
});