// NOTE(andrews): This file is responsible for defining the messages of the Spreed API.
// Some message types are only found in outgoing messages (such as Hello).
// This file does not define the following message types:
// - Screenshare
// - YouTubeVideo
// - Presentation
// - Chat

// NOTE(andrews): SpreedUserID is an alias of the string type but
// it serves as a better way to distinguish the meaning of the type.
export type SpreedUserID = string;

// NOTE(andrews): SpreedMessageCandidate is triggered when another client
// sends you an ICE candidate.
export interface SpreedMessageCandidate {
    Type: 'Candidate';
    To: SpreedUserID;
    Candidate: SpreedICECandidate;
}

// NOTE(andrews): SpreedICECandidate extends the RTCIceCandidate interface.
export interface SpreedICECandidate extends RTCIceCandidateInit {
    type: 'candidate';
}

// NOTE(andrews): SpreedMessageConference is triggered when you join a conference room.
export interface SpreedMessageConference {
    Type: 'Conference';
    Id: SpreedUserID;
    Conference: SpreedUserID[];
}

// NOTE(andrews): SpreedMessageWelcome is triggered when your client connects to a room.
// This message contains a list of the users that are are also connected to the room.
// Please note that each User will contain a 'Status' member except your User (Status will be undefined)
export interface SpreedMessageWelcome {
    Type: 'Welcome';
    Room: SpreedRoom;
    Users: SpreedUser[];
}

// NOTE(andrews): SpreedMessageAnswer is triggered by a client in response to an offer
// you have sent them as a part of the peer connection process.
export interface SpreedMessageAnswer {
    Type: 'Answer';
    To: SpreedUserID;
    Answer: RTCSessionDescription;
}

// NOTE(andrews): SpreedMessageLeft is triggered and sent to all clients when a user has left the room.
// A 'hard' status indicates the user has closed their WebSocket connection.
// A 'soft' status indicates the user navigated to a different room.
export interface SpreedMessageLeft {
    Type: 'Left';
    Id: SpreedUserID;
    Status: null | 'hard' | 'soft';
}

export interface SpreedBye {
    Reason?: string;
}

// NOTE(andrews): SpreedMessageBye is triggered when a user leaves a conversation.
export interface SpreedMessageBye {
    Type: 'Bye'
    To: SpreedUserID;
    Bye: SpreedBye;
}

// NOTE(andrews): SpreedMessageSelf is triggered after you connect to the WebSocket server.
export interface SpreedMessageSelf {
    Type: 'Self';
    ApiVersion: number;
    Id: SpreedUserID; // NOTE(andrews): Used to identify you when you send messages to the WebSocket server.
    Sid: string;
    Stun: any[];
    Suserid: string;
    Token: string;
    Turn: SpreedTurnCredentials;
    Userid: string;
    Version: string;
}

// NOTE(andrews): SpreedMessageStatus is triggered whenever a user updates their name, message, etc.
export interface SpreedMessageStatus {
    Type: 'Status';
    Id: SpreedUserID;
    Prio: number;
    Rev: number;
    Status: SpreedUserStatus;
}

// NOTE(andrews): SpreedMessageJoined is triggered whenever a user joins a room.
export interface SpreedMessageJoined {
    Id: SpreedUserID;
    Type: 'Joined';
    Prio: number;
    Status?: SpreedUserStatus;
    Ua?: string; // NOTE(andrews): Ua stands for user agent (eg. Chrome 58)
}

// NOTE(andrews): SpreedMessageOffer is triggered when a user has sent your client
// an offer.
export interface SpreedMessageOffer {
    Type: 'Offer';
    Offer: RTCSessionDescription;
    To: SpreedUserID;
}

export interface SpreedTurnCredentials {
    password: string;
    ttl: number;
    urls: any; // TODO(andrews): Determine type
    username: string;
}

export interface SpreedRoom {
    Credentials: any; // TODO(andrews): Determine type
    Name: string;
    Type: 'Room'; // TODO(andrews): Determine type
}

// NOTE(andrews): SpreedUser represents a user.
export interface SpreedUser {
    Id: SpreedUserID;
    Prio: number;
    Rev: number;
    Type: null | 'Online'; // TODO(andrews): Determine type.

    // NOTE(andrews): When joining a room you will receive all users in the room (including yourself).
    // The Status member is not defined for your user object.
    Status?: SpreedUserStatus;

    // NOTE(andrews): The user agent of the user (eg. Chrome 58)
    Ua?: string;
}

// NOTE(andrews): SpreedUserStatus contains UI relevant data for a User such as
// their displayName or picture.
export interface SpreedUserStatus {
    BuddyPicture: string;
    DisplayName: string;
    Message: string;
}

// NOTE(andrews): SpreedMessageHello joins a room by Name.
// This message is only used in requests.
export interface SpreedMessageHello {
    Name: string;
    Type: 'Conference';
    Ua: string;
    Version: string;
}
