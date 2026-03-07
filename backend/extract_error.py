import io
with io.open("error.log", "r", encoding="utf-16-le") as f:
    lines = f.readlines()

# Write the last 100 lines to a clean utf-8 file to avoid progress bar spam
with io.open("clean_error.log", "w", encoding="utf-8") as f:
    f.writelines(lines[-100:])
