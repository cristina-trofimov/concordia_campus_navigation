import { StyleSheet } from 'react-native';

export const DirectionStepsStyle = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  instructionsList: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  iconsBox: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 12,
  },
  topBorder: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  stepNumber: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  destinationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  destinationIcon: {
    marginRight: 12,
  },
  destinationText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noPathContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPathText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  levelIndicator: {
    fontSize: 14,
    color: '#0066cc',
    marginLeft: 4,
  }
});