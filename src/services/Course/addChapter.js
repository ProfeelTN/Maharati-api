const mongoose = require("mongoose");
const Course = require("../../models/course");
const cloudinary = require("../../utils/cloudinary");

const addChapterToCourse = async (courseId, chapterData, files) => {
  try {
    // Handle ChapterPhoto upload
    if (chapterData.ChapterPhoto) {
      console.log("Uploading ChapterPhoto...");
      const uploadedResponse = await cloudinary.uploader.upload(
        chapterData.ChapterPhoto,
        { upload_preset: "maharat" }
      );
      chapterData.ChapterPhoto = uploadedResponse.secure_url;
    }
    if (chapterData?.ChapterContent !== null) {
      console.log("Processing ChapterContent...");
      for (let content of chapterData.ChapterContent) {
        if (content.type === "Photo" && content.value) {
          if (content.value.startsWith("data:image")) {
            console.log("Uploading photo content...");
            try {
              const uploadedResponse = await cloudinary.uploader.upload(
                content.value,
                { upload_preset: "maharat" }
              );
              content.value = uploadedResponse.secure_url;
              console.log("Photo uploaded successfully:", content.value);
            } catch (error) {
              console.error("Error uploading photo to Cloudinary:", error);
            }
          }
        } else if (content.type === "Video" && content.value) {
          if (content.value.startsWith("data:video")) {
            console.log("Uploading video content...");

            // Function to upload video with retry logic
            async function uploadVideoWithRetry(videoData, retries = 3) {
              try {
                const result = await new Promise((resolve, reject) => {
                  // Use stream for chunked uploads
                  const stream = cloudinary.uploader.upload_stream(
                    {
                      resource_type: "video",
                      upload_preset: "Files",
                      format: "mp4",
                      transformation: [
                        { height: "640", crop: "scale", quality: "80" },
                      ],
                      chunk_size: 60000000, // Increase or decrease based on your network capabilities
                      timeout: 60000, // Setting a timeout for large uploads
                    },
                    (error, result) => {
                      if (error) {
                        reject(error);
                      } else {
                        resolve(result);
                      }
                    }
                  );

                  // End the stream with video data
                  stream.end(videoData);
                });

                console.log("Uploaded Response:", result);
                return result;
              } catch (error) {
                console.error("Error uploading video to Cloudinary:", error);
                if (retries > 0) {
                  console.log(`Retrying upload... (${retries} retries left)`);
                  return uploadVideoWithRetry(videoData, retries - 1);
                }
                throw error;
              }
            }

            try {
              // Upload video and set the content.value to the URL
              const uploadedResponse = await uploadVideoWithRetry(
                content.value
              );
              content.value = uploadedResponse.secure_url;
              console.log("Video uploaded successfully:", content.value);
            } catch (error) {
              console.error("Failed to upload video after retries:", error);
            }
          }
        }
      }
    } else {
      throw new Error("ChapterContent must be an array.");
    }

    // Handle ChapterVideo upload
    if (chapterData.ChapterVideo) {
      console.log("Uploading ChapterVideo...");
      try {
        const VideoUploadResponse = await cloudinary.uploader.upload(
          chapterData.ChapterVideo,
          {
            resource_type: "video",
            upload_preset: "Files",
            transformation: [{ height: "640", crop: "scale", quality: "80" }],
          }
        );
        chapterData.ChapterVideo = VideoUploadResponse.secure_url;
        console.log(
          "ChapterVideo uploaded successfully:",
          chapterData.ChapterVideo
        );
      } catch (error) {
        console.error("Error uploading video to Cloudinary:", error);
      }
    }

    // Handle file uploads
    if (files && Array.isArray(files)) {
      console.log("Uploading files...");
      const fileUploadPromises = files.map((file) => {
        if (!file.buffer) {
          console.error("File buffer is missing or empty:", file);
          return Promise.reject(new Error("File buffer is missing or empty"));
        }

        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "raw",
              upload_preset: "Files",
              public_id: file.originalname.replace(/\.[^/.]+$/, ""),
            },
            (error, result) => {
              if (error) {
                console.error("Error uploading file to Cloudinary:", error);
                reject(error);
              } else {
                console.log("File uploaded successfully:", result.secure_url);
                resolve(result.secure_url);
              }
            }
          );
          uploadStream.end(file.buffer);
        });
      });

      chapterData.Files = await Promise.all(fileUploadPromises);
    }

    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      console.error("Invalid course ID:", courseId);
      throw new Error("Invalid course ID");
    }

    // Find and update the course
    console.log("Finding course by ID:", courseId);
    const course = await Course.findById(courseId);
    if (!course) {
      console.error("Course not found with ID:", courseId);
      throw new Error("Course not found");
    }

    console.log("Adding chapter to course...");
    course.Chapters.push(chapterData);
    await course.save();
    console.log("Chapter added successfully.");

    return course;
  } catch (error) {
    console.error("Error adding chapter:", error);
    throw error;
  }
};

module.exports = {
  addChapterToCourse,
};
