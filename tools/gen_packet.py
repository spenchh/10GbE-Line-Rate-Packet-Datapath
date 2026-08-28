message = 1
sequence_number = 42
symbol_id = 7
bid_price = 1743100
ask_price = 1743300
bid_size = 800
ask_size = 500
timestamp = 123456789

bits_eight = 8
bits_sixteen = 16
bits_thirty_two = 32
bits_sixty_four = 64

# Range check helper function
def pack_uint(name, value, width):
    max_value = (1 << width) - 1

    if value < 0 or value > max_value:
        raise ValueError(
            f"{name}={value} does not fit in {width} bits "
            f"(max={max_value})"
        )
    return f"{value:0{width}b}"


packet_bits = (
    pack_uint("message", message, 8)
    + pack_uint("sequence_number", sequence_number, 32)
    + pack_uint("symbol_id", symbol_id, 16)
    + pack_uint("bid_price", bid_price, 32)
    + pack_uint("ask_price", ask_price, 32)
    + pack_uint("bid_size", bid_size, 32)
    + pack_uint("ask_size", ask_size, 32)
    + pack_uint("timestamp", timestamp, 64)
)

assert len(packet_bits) == 248

packet_hex = f"{int(packet_bits, 2):062x}"

print("packet width:", len(packet_bits))
print("packet bits:", packet_bits)
print("packet hex:", packet_hex)