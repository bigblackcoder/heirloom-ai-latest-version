import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Platform,
  SafeAreaView,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

export default function IdentityCapsuleScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('data');
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Identity Capsule</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => {}}
          >
            <SettingsIcon />
          </TouchableOpacity>
        </View>
        
        {/* Capsule Card */}
        <View style={styles.capsuleCard}>
          <View style={styles.capsuleHeader}>
            <View style={styles.logoContainer}>
              <HeirloomIcon />
            </View>
            <Text style={styles.capsuleName}>Primary Identity</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verified</Text>
              <CheckIcon />
            </View>
          </View>
          
          <View style={styles.capsuleInfo}>
            <Text style={styles.infoLabel}>Verified Since</Text>
            <Text style={styles.infoValue}>March 17, 2025</Text>
            
            <Text style={styles.infoLabel}>Connected Services</Text>
            <View style={styles.serviceIcons}>
              <View style={styles.serviceIcon}>
                <AnthropicIcon />
              </View>
              <View style={styles.serviceIcon}>
                <GeminiIcon />
              </View>
              <View style={[styles.serviceIcon, styles.inactiveService]}>
                <PlusIcon />
              </View>
            </View>
          </View>
          
          <View style={styles.securityLevel}>
            <Text style={styles.securityText}>Security Level: High</Text>
            <View style={styles.securityBar}>
              <View style={styles.securityFill} />
            </View>
          </View>
        </View>
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'data' && styles.activeTab]}
            onPress={() => setActiveTab('data')}
          >
            <Text style={[styles.tabText, activeTab === 'data' && styles.activeTabText]}>
              Verified Data
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
            onPress={() => setActiveTab('activity')}
          >
            <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>
              Activity
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
            onPress={() => setActiveTab('settings')}
          >
            <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Content */}
        {activeTab === 'data' && (
          <View style={styles.tabContent}>
            <DataItem 
              title="Full Legal Name" 
              value="John A. Smith" 
              icon={<ProfileIcon />} 
              isVerified={true}
            />
            <DataItem 
              title="Date of Birth" 
              value="April 15, 1990" 
              icon={<CalendarIcon />} 
              isVerified={true}
            />
            <DataItem 
              title="Email Address" 
              value="john.smith@example.com" 
              icon={<EmailIcon />} 
              isVerified={true}
            />
            <DataItem 
              title="Phone Number" 
              value="+1 (555) 123-4567" 
              icon={<PhoneIcon />} 
              isVerified={false}
            />
            
            <TouchableOpacity style={styles.addDataButton}>
              <Text style={styles.addDataText}>Add More Verified Data</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {activeTab === 'activity' && (
          <View style={styles.tabContent}>
            <ActivityItem 
              title="Face Verification"
              description="Completed biometric verification"
              time="Today, 11:32 AM"
              icon={<FaceIcon />}
            />
            <ActivityItem 
              title="Identity Capsule Created"
              description="Primary identity capsule set up"
              time="Today, 11:30 AM"
              icon={<CapsuleIcon />}
            />
            <ActivityItem 
              title="Anthropic Connection"
              description="Granted access to verified name"
              time="Today, 11:35 AM"
              icon={<AnthropicMiniIcon />}
            />
          </View>
        )}
        
        {activeTab === 'settings' && (
          <View style={styles.tabContent}>
            <SettingsItem 
              title="Auto-Verify Connections"
              description="Automatically verify new service connections"
              isEnabled={false}
            />
            <SettingsItem 
              title="Biometric Unlock"
              description="Use Face ID to access your capsule"
              isEnabled={true}
            />
            <SettingsItem 
              title="Data Sharing Notifications"
              description="Get notified when data is shared"
              isEnabled={true}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Data Item Component
function DataItem({ title, value, icon, isVerified }) {
  return (
    <View style={styles.dataItem}>
      <View style={styles.dataIconContainer}>
        {icon}
      </View>
      <View style={styles.dataContent}>
        <Text style={styles.dataTitle}>{title}</Text>
        <Text style={styles.dataValue}>{value}</Text>
      </View>
      {isVerified ? (
        <View style={styles.verifiedIcon}>
          <VerifiedIcon />
        </View>
      ) : (
        <TouchableOpacity style={styles.verifyButton}>
          <Text style={styles.verifyText}>Verify</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Activity Item Component
function ActivityItem({ title, description, time, icon }) {
  return (
    <View style={styles.activityItem}>
      <View style={styles.activityIconContainer}>
        {icon}
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityDescription}>{description}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
    </View>
  );
}

// Settings Item Component
function SettingsItem({ title, description, isEnabled }) {
  const [enabled, setEnabled] = useState(isEnabled);
  
  return (
    <View style={styles.settingsItem}>
      <View style={styles.settingsContent}>
        <Text style={styles.settingsTitle}>{title}</Text>
        <Text style={styles.settingsDescription}>{description}</Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={setEnabled}
        trackColor={{ false: '#767577', true: '#4caf5060' }}
        thumbColor={enabled ? '#4caf50' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
      />
    </View>
  );
}

// Icons Components
const SettingsIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PlusIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5V19M5 12H19"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HeirloomIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#143404" />
    <Path
      d="M7 12H17M12 7V17"
      stroke="#4caf50"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const AnthropicIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="10" fill="#D09CA7" />
  </Svg>
);

const GeminiIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="10" fill="#8E75B5" />
  </Svg>
);

const ProfileIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
      stroke="#4caf50"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18"
      stroke="#4caf50"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EmailIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      stroke="#4caf50"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 6l-10 7L2 6"
      stroke="#4caf50"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PhoneIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
      stroke="#4caf50"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const VerifiedIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
      stroke="#4caf50"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 4L12 14.01l-3-3"
      stroke="#4caf50"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const FaceIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#d4a166" strokeWidth="2" />
    <Path
      d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"
      stroke="#d4a166"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CapsuleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke="#143404"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AnthropicMiniIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#D09CA7" strokeWidth="2" />
  </Svg>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 16,
    paddingBottom: 16,
    backgroundColor: '#143404',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capsuleCard: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  capsuleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  capsuleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#143404',
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    backgroundColor: '#4caf50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: 'center',
  },
  verifiedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  capsuleInfo: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 12,
  },
  serviceIcons: {
    flexDirection: 'row',
    marginTop: 4,
  },
  serviceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  inactiveService: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  securityLevel: {
    marginTop: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#143404',
    fontWeight: '500',
    marginBottom: 8,
  },
  securityBar: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
  },
  securityFill: {
    height: '100%',
    width: '85%',
    backgroundColor: '#4caf50',
    borderRadius: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#143404',
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dataIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dataContent: {
    flex: 1,
  },
  dataTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  verifiedIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButton: {
    backgroundColor: '#f0f4eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  verifyText: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '600',
  },
  addDataButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 10,
    backgroundColor: '#f0f4eb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  addDataText: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  settingsDescription: {
    fontSize: 14,
    color: '#666',
  },
});