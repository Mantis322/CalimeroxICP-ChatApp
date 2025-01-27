use calimero_sdk::{
    app,
    borsh::{BorshDeserialize, BorshSerialize},
    serde::{Serialize, Deserialize},
    env,
 };
use std::collections::HashMap;

#[derive(BorshDeserialize, BorshSerialize, Clone, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub enum RoomType {
    Chat,
    Voice
}

#[derive(BorshDeserialize, BorshSerialize, Clone)]
#[borsh(crate = "calimero_sdk::borsh")]
pub struct Message {
    sender: String,
    content: String,
    timestamp: u64,
}

#[derive(BorshDeserialize, BorshSerialize, Clone)]
#[borsh(crate = "calimero_sdk::borsh")]
pub struct Room {
   name: String,
   room_type: RoomType,
   password_hash: String,
   messages: Vec<Message>,
   users: Vec<String>, 
   creator: String,
}

#[derive(BorshDeserialize, BorshSerialize)]
#[borsh(crate = "calimero_sdk::borsh")]
pub struct UserProfile {
    username: String,
    wallet_address: String,
}

#[app::event]
pub enum Event {
    RoomCreated { name: String },
    UserJoinedRoom { room: String, user: String },
    MessageSent { room: String, sender: String, content: String },
    RoomDeleted { name: String },
    UserRegistered { username: String, wallet_address: String },
    SignalingMessage { room: String, sender: String, receiver: String, content: String },
}

#[app::state(emits = Event)]
#[derive(Default, BorshDeserialize, BorshSerialize)]
#[borsh(crate = "calimero_sdk::borsh")]
pub struct ChatState {
    rooms: HashMap<String, Room>,
    users: HashMap<String, UserProfile>,
    usernames: HashMap<String, String>,
}

#[app::logic]
impl ChatState {
    #[app::init]
    pub fn init() -> ChatState {
        ChatState {
            rooms: HashMap::new(),
            users: HashMap::new(),
            usernames: HashMap::new(),
        }
    }

    pub fn register_user(&mut self, username: String, wallet_address: String) -> bool {
        if self.usernames.contains_key(&username) || self.users.contains_key(&wallet_address) {
            env::log("Username already taken or wallet already registered");
            return false;
        }

        let user = UserProfile {
            username: username.clone(),
            wallet_address: wallet_address.clone(),
        };

        self.users.insert(wallet_address.clone(), user);
        self.usernames.insert(username.clone(), wallet_address.clone());
        
        app::emit!(Event::UserRegistered { 
            username, 
            wallet_address 
        });
        
        true
    }

    pub fn get_username(&self, wallet_address: String) -> Option<String> {
        self.users.get(&wallet_address).map(|profile| profile.username.clone())
    }

    pub fn get_wallet_address(&self, username: String) -> Option<String> {
        self.usernames.get(&username).cloned()
    }

    pub fn create_room(&mut self, name: String, password: String, creator: String, room_type: RoomType) -> bool {
        if self.rooms.contains_key(&name) {
            env::log("Room already exists");
            return false;
        }

        let room = Room {
            name: name.clone(),
            room_type,
            password_hash: password,
            messages: Vec::new(),
            users: Vec::new(),
            creator,
        };

        self.rooms.insert(name.clone(), room);
        app::emit!(Event::RoomCreated { name });
        true
    }

    pub fn join_room(&mut self, room_name: String, user: String, password: String) -> bool {
        if let Some(room) = self.rooms.get_mut(&room_name) {
            if room.password_hash != password {
                env::log("Invalid password");
                return false;
            }

            if !room.users.contains(&user) {
                room.users.push(user.clone());
                app::emit!(Event::UserJoinedRoom { 
                    room: room_name.clone(),
                    user: user.clone()
                });
                env::log(&format!("User {} joined room {}", user, room_name));
            }
            true
        } else {
            env::log("Room not found");
            false
        }
    }

    pub fn send_message(&mut self, room_name: String, sender: String, content: String) -> bool {
        if let Some(room) = self.rooms.get_mut(&room_name) {
            if !room.users.contains(&sender) {
                env::log("User not in room");
                return false;
            }

            let message = Message {
                sender: sender.clone(),
                content: content.clone(),
                timestamp: 0,
            };

            room.messages.push(message);
            app::emit!(Event::MessageSent {
                room: room_name.clone(),
                sender,
                content
            });
            env::log("Message sent successfully");
            true
        } else {
            env::log("Room not found");
            false
        }
    }

    pub fn send_signaling(&mut self, room_name: String, sender: String, receiver: String, content: String) -> bool {
        if let Some(room) = self.rooms.get(&room_name) {
            if !room.users.contains(&sender) || !room.users.contains(&receiver) {
                return false;
            }
            
            app::emit!(Event::SignalingMessage {
                room: room_name,
                sender,
                receiver,
                content
            });
            true
        } else {
            false
        }
    }

    pub fn get_room_messages(&self, room_name: String, user: String) -> Vec<(String, String, u64)> {
        if let Some(room) = self.rooms.get(&room_name) {
            if !room.users.contains(&user) {
                env::log(&format!("User {} is not in room {}", user, room_name));
                return Vec::new();
            }
            
            room.messages
                .iter()
                .map(|msg| (msg.sender.clone(), msg.content.clone(), msg.timestamp))
                .collect()
        } else {
            env::log("Room not found");
            Vec::new()
        }
    }

    pub fn get_room_users(&self, room_name: String) -> Vec<String> {
        self.rooms
            .get(&room_name)
            .map(|room| room.users.clone())
            .unwrap_or_default()
    }

    pub fn list_rooms(&self) -> Vec<String> {
        self.rooms.keys().cloned().collect()
    }

    pub fn leave_room(&mut self, room_name: String, user: String) -> bool {
        if let Some(room) = self.rooms.get_mut(&room_name) {
            if let Some(pos) = room.users.iter().position(|x| x == &user) {
                room.users.remove(pos);
                env::log(&format!("User {} left room {}", user, room_name));
                true
            } else {
                env::log("User not in room");
                false
            }
        } else {
            env::log("Room not found");
            false
        }
    }

    pub fn delete_room(&mut self, room_name: String, wallet_address: String) -> bool {
        if let Some(room) = self.rooms.get(&room_name) {
            if room.creator != wallet_address {
                env::log("Only room creator can delete the room");
                return false;
            }
            
            self.rooms.remove(&room_name);
            app::emit!(Event::RoomDeleted { name: room_name });
            true
        } else {
            env::log("Room not found");
            false
        }
    }

    pub fn get_room_info(&self, room_name: String) -> Option<(String, RoomType, String)> {
        self.rooms.get(&room_name).map(|room| {
            (room.name.clone(), room.room_type.clone(), room.creator.clone())
        })
     }
}