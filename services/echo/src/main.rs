use actix::{Actor, StreamHandler};
use actix_web::{web, App, Error, HttpRequest, HttpResponse, HttpServer, get, middleware::Logger};
use actix_web_actors::ws;
use actix_cors::Cors;
use log::{info, warn};
use std::env;
use std::path::PathBuf;

// WebSocket actor
struct EchoWebSocket;

impl Actor for EchoWebSocket {
    type Context = ws::WebsocketContext<Self>;
}

// Handler for WebSocket messages
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for EchoWebSocket {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => {
                info!("Ping received");
                ctx.pong(&msg);
            }
            Ok(ws::Message::Text(text)) => {
                info!("Text message received: {:?}", text);
                // Echo the message back to the client
                ctx.text(text);
            }
            Ok(ws::Message::Binary(bin)) => {
                info!("Binary message received: {} bytes", bin.len());
                // Echo binary data back
                ctx.binary(bin);
            }
            Ok(ws::Message::Close(reason)) => {
                info!("Connection closed: {:?}", reason);
                ctx.close(reason);
            }
            _ => (),
        }
    }
}

// WebSocket connection handler
async fn ws_route(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    info!("New WebSocket connection from: {:?}", req.peer_addr());
    ws::start(EchoWebSocket {}, &req, stream)
}

// Health check endpoint
async fn health() -> HttpResponse {
    HttpResponse::Ok().body("OK")
}

// Serve index.html
#[get("/")]
async fn index() -> HttpResponse {
    HttpResponse::Ok()
        .content_type("text/html")
        .body(include_str!("static/index.html"))
}

// Main function
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logger
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    
    // Get host and port from environment variables or use defaults
    let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port = env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .expect("PORT must be a number");
    
    info!("Starting Echo WebSocket server on {}:{}", host, port);

    // Start HTTP server
    HttpServer::new(|| {
        // Configure CORS
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();
        
        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .service(index)
            .route("/ws", web::get().to(ws_route))
            .route("/health", web::get().to(health))
    })
    .bind((host, port))?
    .run()
    .await
}
