//! Receipt raster rendering, without a background print service or network access.
use image::{DynamicImage, GenericImageView, imageops::FilterType};
use std::io::Cursor;

pub fn raster(file: &[u8], width: usize) -> Option<Vec<u8>> {
    if file.is_empty() || file.len() > 2 * 1024 * 1024 {
        return None;
    }
    let reader = image::ImageReader::new(Cursor::new(file))
        .with_guessed_format().ok()?;
    let (original_width, original_height) = reader.into_dimensions().ok()?;
    if original_width == 0 || original_height == 0 ||
        u64::from(original_width) * u64::from(original_height) > 4_000_000 {
        return None;
    }
    let image = image::load_from_memory(file).ok()?;
    let (max_w, max_h) = ((width * 6) as u32, 160u32);
    let (w, h) = image.dimensions();
    let scale = (max_w as f32 / w as f32).min(max_h as f32 / h as f32).min(1.0);
    let (w, h) = (
        ((w as f32 * scale).round() as u32).max(1),
        ((h as f32 * scale).round() as u32).max(1),
    );
    let image = DynamicImage::ImageRgba8(image.resize_exact(w, h, FilterType::Lanczos3).to_rgba8());
    let mut grey: Vec<f32> = image.to_rgba8().pixels().map(|p| {
        let [r, g, b, a] = p.0.map(|v| v as f32);
        let luma = 0.299 * r + 0.587 * g + 0.114 * b;
        luma * a / 255.0 + 255.0 * (1.0 - a / 255.0)
    }).collect();
    let (w, h) = (w as usize, h as usize);
    let row_bytes = w.div_ceil(8);
    let mut bits = vec![0u8; row_bytes * h];
    for y in 0..h {
        for x in 0..w {
            let old = grey[y * w + x];
            let black = old < 128.0;
            if black { bits[y * row_bytes + x / 8] |= 0x80 >> (x % 8); }
            let error = old - if black { 0.0 } else { 255.0 };
            let mut spread = |dx: isize, dy: usize, share: f32| {
                let nx = x as isize + dx;
                if nx >= 0 && (nx as usize) < w && y + dy < h {
                    grey[(y + dy) * w + nx as usize] += error * share;
                }
            };
            spread(1, 0, 7.0 / 16.0);
            spread(-1, 1, 3.0 / 16.0);
            spread(0, 1, 5.0 / 16.0);
            spread(1, 1, 1.0 / 16.0);
        }
    }
    let mut bytes = vec![
        0x1d, b'v', b'0', 0,
        (row_bytes & 0xff) as u8,
        (row_bytes >> 8) as u8,
        (h & 0xff) as u8,
        (h >> 8) as u8,
    ];
    bytes.extend(bits);
    Some(bytes)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ignores_invalid_or_unreasonably_large_input() {
        assert!(raster(b"<html>", 48).is_none());
        assert!(raster(&vec![0; 2 * 1024 * 1024 + 1], 48).is_none());
    }
}
