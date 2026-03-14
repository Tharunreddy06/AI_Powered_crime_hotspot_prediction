from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent="crime-intel-academic")

def get_lat_lon(place):
    if not place:
        return None, None, None, None, None

    location = geolocator.geocode(place)
    if not location:
        return None, None, None, None, None

    address = location.address.split(",")

    country = address[-1].strip() if len(address) >= 1 else None
    state = address[-2].strip() if len(address) >= 2 else None
    city = address[-3].strip() if len(address) >= 3 else place

    return country, state, city, location.latitude, location.longitude
