import { Server } from "socket.io";
import Redis from "ioredis";
import { config } from "dotenv";
config();

const pub = new Redis({
  host: process.env.AIVEN_HOST,
  port: process.env.AIVEN_PORT ? parseInt(process.env.AIVEN_PORT) : undefined,
  username: process.env.AIVEN_USERNAME,
  password: process.env.AIVEN_PASSWORD,
});
const sub = new Redis({
  host: process.env.AIVEN_HOST,
  port: process.env.AIVEN_PORT ? parseInt(process.env.AIVEN_PORT) : undefined,
  username: process.env.AIVEN_USERNAME,
  password: process.env.AIVEN_PASSWORD,
});

class SocketService {
  private _io: Server;

  constructor() {
    console.log(`Init Socket Service...`);
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
    sub.subscribe("MESSAGES");
  }

  public initListeners() {
    const io = this.io;
    console.log(`Init socket listeners...`);

    io.on("connect", async (socket) => {
      console.log(`New Socket Connected`, socket.id);

      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New Message Received", message);
        

        //publish this message to redis
        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });
    });

    sub.on("message", (channel, message) => {
      if (channel === "MESSAGES") {
        io.emit("message", { message });
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
