interface SaveContentParams {
  contentType: "audio" | "photo" | "video";
  contentUrl: string;
  title?: string;
  prompt?: string;
  metadata?: any;
}

export async function saveGeneratedContent(params: SaveContentParams) {
  try {
    const response = await fetch("/api/generated-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error("Failed to save generated content");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving generated content:", error);
    throw error;
  }
} 