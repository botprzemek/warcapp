use std::sync::Arc;
use std::time::{Instant, Duration};
use tokio::sync::Barrier;
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::protocol::Message;
use futures_util::{SinkExt, StreamExt};

#[tokio::test(flavor = "multi_thread", worker_threads = 8)]
async fn bench_engine_processing() {
    let n = 1000;
    let url = "ws://localhost:9001";

    let barrier = Arc::new(Barrier::new(n + 1));
    let mut tasks = Vec::with_capacity(n);

    for _ in 0..n {
        let b = barrier.clone();
        tasks.push(tokio::spawn(async move {
            let (ws_stream, _) = connect_async(url)
                .await
                .expect("connection failed");

            let (mut write, mut read) = ws_stream.split();

            b.wait().await; // START

            let payload = vec![0, 1, 2, 3];

            let t0 = Instant::now();
            write
                .send(Message::Binary(payload.into()))
                .await
                .expect("send failed");

            let _message = read.next().await; // response
            t0.elapsed()
        }));
    }

    // --- START ---
    barrier.wait().await;
    let wall_start = Instant::now();

    let mut latencies: Vec<Duration> =
        futures_util::future::join_all(tasks)
            .await
            .into_iter()
            .map(|r| r.expect("task failed"))
            .collect();

    let wall_total = wall_start.elapsed();
    // --- END ---

    latencies.sort_unstable();

    let p50 = percentile(&latencies, 50.0);
    let p95 = percentile(&latencies, 95.0);
    let p99 = percentile(&latencies, 99.0);

    let avg = latencies
        .iter()
        .map(|d| d.as_secs_f64())
        .sum::<f64>() / n as f64;

    let throughput = n as f64 / wall_total.as_secs_f64();

    println!("clients: {}", n);
    println!("wall time: {:?}", wall_total);
    println!("avg latency: {:.2} µs", avg * 1_000_000.0);
    println!("p50 latency: {:.2} µs", p50 * 1_000_000.0);
    println!("p95 latency: {:.2} µs", p95 * 1_000_000.0);
    println!("p99 latency: {:.2} µs", p99 * 1_000_000.0);
    println!("throughput: {:.0} req/s", throughput);
}

fn percentile(data: &[Duration], p: f64) -> f64 {
    let idx = ((p / 100.0) * data.len() as f64).ceil() as usize - 1;
    data[idx].as_secs_f64()
}
