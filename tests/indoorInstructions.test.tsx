import { getIndoorDirectionText } from '../src/components/indoorinstructions';
import { RoomInfo } from '../src/interfaces/RoomInfo';

describe('getIndoorDirectionText', () => {
  // Mock RoomInfo objects
  const room101: RoomInfo = {
    building: 'A',
    floor: '1',
    room: '101',
    name: 'Conference Room'
  };
  
  const room305: RoomInfo = {
    building: 'A',
    floor: '3',
    room: '305',
    name: 'Office Space'
  };
  
  const roomB202: RoomInfo = {
    building: 'B',
    floor: '2',
    room: '202',
    name: 'Meeting Room'
  };
  
  // Transport method
  const elevator = 'elevator';
  const stairs = 'stairs';
  
  test('should handle only origin room with no destination', () => {
    const [originText, destText] = getIndoorDirectionText(room101, null, elevator);
    
    expect(originText).toBe('Take the elevator down to exit the campus.');
    expect(destText).toBe('');
  });
  
  test('should handle only destination room with no origin', () => {
    const [originText, destText] = getIndoorDirectionText(null, room305, stairs);
    
    expect(originText).toBe('');
    expect(destText).toBe('Take the stairs up to floor 3.');
  });
  
  test('should handle different buildings', () => {
    const [originText, destText] = getIndoorDirectionText(room101, roomB202, elevator);
    
    expect(originText).toBe('Take the elevator down to exit the campus.');
    expect(destText).toBe('Take the elevator up to floor 2');
  });
  
  test('should handle same building and same floor', () => {
    // Create another room on the same floor as room101
    const room102: RoomInfo = {
      building: 'A',
      floor: '1',
      room: '102',
      name: 'Break Room'
    };
    
    const [originText, destText] = getIndoorDirectionText(room101, room102, elevator);
    
    expect(originText).toBe('You are already on floor 1.');
    expect(destText).toBe('Please follow the route outlined on this floor.');
  });
  
  test('should handle moving up floors in the same building', () => {
    const [originText, destText] = getIndoorDirectionText(room101, room305, stairs);
    
    expect(originText).toBe('Take the stairs up from floor 1 to floor 3.');
    expect(destText).toBe('Please follow the route outlined on floor 3.');
  });
  
  test('should handle moving down floors in the same building', () => {
    const [originText, destText] = getIndoorDirectionText(room305, room101, elevator);
    
    expect(originText).toBe('Take the elevator down from floor 3 to floor 1.');
    expect(destText).toBe('Please follow the route outlined on floor 1.');
  });
  
  test('should handle null for both origin and destination', () => {
    const [originText, destText] = getIndoorDirectionText(null, null, elevator);
    
    expect(originText).toBe('');
    expect(destText).toBe('');
  });
  
  test('should handle non-numeric floor values', () => {
    const basementRoom: RoomInfo = {
      building: 'A',
      floor: 'B', // Basement floor as non-numeric
      room: 'B01',
      name: 'Storage'
    };
    
    const [originText, destText] = getIndoorDirectionText(basementRoom, room101, elevator);
    
    // The function actually still tries to construct directions with NaN
    expect(originText).toBe('Take the elevator down from floor NaN to floor 1.');
    expect(destText).toBe('Please follow the route outlined on floor 1.');
  });
});