import json
from PIL import Image as PILImage  # Use alias to avoid conflict with model name
from PIL import PngImagePlugin
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

def extract_comfyui_metadata(image_path: str) -> Optional[Dict[str, Any]]:
    """Extracts ComfyUI metadata (often stored in 'prompt' or 'workflow' PNG chunks)."""
    try:
        img = PILImage.open(image_path)
        if img.format == "PNG":
            # ComfyUI often stores workflow/metadata in 'prompt' or 'workflow' text chunks
            # Pillow accesses these via the .info dictionary
            prompt_data = img.info.get('prompt')
            workflow_data = img.info.get('workflow')

            raw_metadata = None
            if prompt_data:
                raw_metadata = prompt_data
            elif workflow_data:
                raw_metadata = workflow_data
            # Add checks for other potential keys if needed
            # e.g., parameters_data = img.info.get('parameters')

            if raw_metadata:
                try:
                    metadata = json.loads(raw_metadata)
                    # Try to extract specific useful fields - THIS MAY NEED ADJUSTMENT
                    # based on how your ComfyUI saves data.
                    # It often involves navigating a nested structure representing the nodes.
                    # We'll return the whole parsed JSON for now, frontend can parse later.
                    # Add specific extraction logic here if you know the structure.
                    # For example:
                    # seed = metadata.get('seed_node_id', {}).get('inputs', {}).get('seed')
                    return metadata  # Return the full parsed JSON
                except json.JSONDecodeError as json_err:
                    logger.warning(f"Could not parse metadata JSON from {image_path}: {json_err}")
                    # Optionally return the raw string if parsing fails
                    # return {"raw_metadata": raw_metadata}
                except Exception as e:
                    logger.error(f"Error processing metadata for {image_path}: {e}")
            else:
                # logger.info(f"No 'prompt' or 'workflow' metadata found in {image_path}")
                pass
        else:
            # logger.info(f"Image format is not PNG ({img.format}), skipping ComfyUI metadata extraction for {image_path}")
            pass  # Handle other formats (like JPG EXIF) if needed in the future

    except FileNotFoundError:
        logger.error(f"Image file not found: {image_path}")
    except Exception as e:
        logger.error(f"Failed to open or process image {image_path}: {e}")

    return None  # Return None if no metadata found or error occurs