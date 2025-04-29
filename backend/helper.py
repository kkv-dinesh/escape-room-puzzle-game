from datetime import datetime
def calculate_duration(start, end):
    if start and end:
        start_time = start if isinstance(start, datetime) else start["$date"]
        end_time = end if isinstance(end, datetime) else end["$date"]
        start_dt = datetime.fromisoformat(str(start_time).replace("Z", "+00:00"))
        end_dt = datetime.fromisoformat(str(end_time).replace("Z", "+00:00"))
        return str(end_dt - start_dt)
    return None