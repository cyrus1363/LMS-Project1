import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users, 
  MessageSquare, 
  Share, 
  Settings,
  Hand,
  UserCheck,
  Clock,
  ChevronDown,
  Monitor,
  Phone,
  PhoneOff,
  Grid3X3,
  Maximize,
  Volume2,
  VolumeX,
  MoreVertical
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  role: 'instructor' | 'student';
  isVideoOn: boolean;
  isAudioOn: boolean;
  isHandRaised: boolean;
  isPresent: boolean;
  joinedAt: string;
}

interface VirtualClassroomProps {
  roomName: string;
  className: string;
  isInstructor?: boolean;
}

export default function VirtualClassroom({ roomName, className, isInstructor = false }: VirtualClassroomProps) {
  const { toast } = useToast();
  const jitsiRef = useRef<HTMLDivElement>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: 'Dr. Sarah Wilson',
      role: 'instructor',
      isVideoOn: true,
      isAudioOn: true,
      isHandRaised: false,
      isPresent: true,
      joinedAt: '09:00'
    },
    {
      id: '2', 
      name: 'John Smith',
      role: 'student',
      isVideoOn: true,
      isAudioOn: false,
      isHandRaised: true,
      isPresent: true,
      joinedAt: '09:02'
    },
    {
      id: '3',
      name: 'Emily Davis',
      role: 'student', 
      isVideoOn: false,
      isAudioOn: true,
      isHandRaised: false,
      isPresent: true,
      joinedAt: '09:01'
    },
    {
      id: '4',
      name: 'Mike Johnson',
      role: 'student',
      isVideoOn: true,
      isAudioOn: true,
      isHandRaised: false,
      isPresent: false,
      joinedAt: '09:05'
    }
  ]);

  const [chatMessages, setChatMessages] = useState([
    { id: '1', user: 'Dr. Sarah Wilson', message: 'Welcome everyone! We\'ll start in 2 minutes.', time: '09:00' },
    { id: '2', user: 'John Smith', message: 'Thank you, looking forward to the session!', time: '09:01' },
    { id: '3', user: 'System', message: 'Recording started', time: '09:02', isSystem: true }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [showBreakoutRooms, setShowBreakoutRooms] = useState(false);

  // Initialize Jitsi Meet
  useEffect(() => {
    if (isJoined && jitsiRef.current) {
      // Jitsi Meet embed code
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.onload = () => {
        const api = new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
          roomName: roomName,
          parentNode: jitsiRef.current,
          width: '100%',
          height: 400,
          configOverwrite: {
            prejoinPageEnabled: false,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'hangup', 'desktop', 'chat',
              'recording', 'livestreaming', 'etherpad', 'sharedvideo',
              'settings', 'raisehand', 'videoquality', 'filmstrip',
              'invite', 'feedback', 'stats', 'shortcuts', 'tileview'
            ],
          },
          userInfo: {
            displayName: isInstructor ? 'Instructor' : 'Student'
          }
        });

        // Auto-mark attendance when user joins
        api.addEventListener('videoConferenceJoined', () => {
          toast({
            title: "Joined Classroom",
            description: "Attendance automatically recorded",
          });
        });
      };
      document.body.appendChild(script);
    }
  }, [isJoined, roomName, isInstructor, toast]);

  const joinMeeting = () => {
    setIsJoined(true);
  };

  const leaveMeeting = () => {
    setIsJoined(false);
    if (jitsiRef.current) {
      jitsiRef.current.innerHTML = '';
    }
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        user: isInstructor ? 'Instructor' : 'You',
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
    }
  };

  const createBreakoutRoom = () => {
    toast({
      title: "Breakout Room Created",
      description: "Students can now join smaller discussion groups",
    });
    setShowBreakoutRooms(true);
  };

  const markAttendance = (participantId: string) => {
    setParticipants(prev => 
      prev.map(p => 
        p.id === participantId 
          ? { ...p, isPresent: !p.isPresent }
          : p
      )
    );
  };

  const presentParticipants = participants.filter(p => p.isPresent);
  const attendanceRate = Math.round((presentParticipants.length / participants.length) * 100);

  if (!isJoined) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">{className}</CardTitle>
            <p className="text-gray-600">Virtual Classroom Session</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Badge variant="outline" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {participants.length} Participants
                </Badge>
                <Badge variant="outline" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  45 minutes
                </Badge>
                <Badge variant="outline" className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  {attendanceRate}% Present
                </Badge>
              </div>

              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={toggleVideo}
                  className={isVideoOn ? "bg-green-50" : "bg-red-50"}
                >
                  {isVideoOn ? <Video className="h-4 w-4 mr-2" /> : <VideoOff className="h-4 w-4 mr-2" />}
                  Camera {isVideoOn ? 'On' : 'Off'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={toggleAudio}
                  className={isAudioOn ? "bg-green-50" : "bg-red-50"}
                >
                  {isAudioOn ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
                  Mic {isAudioOn ? 'On' : 'Off'}
                </Button>
              </div>

              <Button size="lg" onClick={joinMeeting} className="px-8">
                <Video className="h-5 w-5 mr-2" />
                Join Classroom
              </Button>
            </div>

            {/* Pre-join participant list */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Participants ({participants.length})</h3>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${participant.isPresent ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">{participant.name}</span>
                      {participant.role === 'instructor' && (
                        <Badge variant="secondary" className="text-xs">Instructor</Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">Joined {participant.joinedAt}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Video Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{className}</CardTitle>
              <div className="flex gap-2">
                {isInstructor && (
                  <>
                    <Button size="sm" variant="outline" onClick={createBreakoutRoom}>
                      <Users className="h-4 w-4 mr-2" />
                      Breakout Rooms
                    </Button>
                    <Button size="sm" variant="outline">
                      <Monitor className="h-4 w-4 mr-2" />
                      Share Screen
                    </Button>
                  </>
                )}
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Jitsi Meet container */}
              <div ref={jitsiRef} className="w-full h-96 bg-gray-900 rounded-lg mb-4" />
              
              {/* Video Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={toggleAudio}
                  className={isAudioOn ? "bg-green-50" : "bg-red-50"}
                >
                  {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={toggleVideo}
                  className={isVideoOn ? "bg-green-50" : "bg-red-50"}
                >
                  {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm">
                  <Hand className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={leaveMeeting}>
                  <PhoneOff className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Tabs defaultValue="participants" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="participants">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Participants ({presentParticipants.length})</span>
                    {isInstructor && (
                      <Button size="sm" variant="outline">
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${participant.isPresent ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-sm font-medium">{participant.name}</span>
                        {participant.role === 'instructor' && (
                          <Badge variant="secondary" className="text-xs">Host</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {participant.isHandRaised && (
                          <Hand className="h-3 w-3 text-orange-500" />
                        )}
                        {participant.isVideoOn ? (
                          <Video className="h-3 w-3 text-green-600" />
                        ) : (
                          <VideoOff className="h-3 w-3 text-gray-400" />
                        )}
                        {participant.isAudioOn ? (
                          <Mic className="h-3 w-3 text-green-600" />
                        ) : (
                          <MicOff className="h-3 w-3 text-gray-400" />
                        )}
                        {isInstructor && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => markAttendance(participant.id)}
                            className="h-6 w-6 p-0"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Breakout Rooms */}
              {showBreakoutRooms && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Breakout Rooms</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Room 1 (3 students)
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Room 2 (2 students)
                    </Button>
                    {isInstructor && (
                      <Button size="sm" className="w-full">
                        Create New Room
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="chat">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Class Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`text-sm ${msg.isSystem ? 'text-center text-gray-500 italic' : ''}`}>
                        {!msg.isSystem && (
                          <div className="font-medium text-xs text-gray-600">{msg.user} • {msg.time}</div>
                        )}
                        <div className={msg.isSystem ? '' : 'mt-1'}>{msg.message}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                    <Button size="sm" onClick={sendMessage}>
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}