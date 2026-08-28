# Example market-data fields.
# These are normal integer values before we pack them into a binary packet.
message_type = 1
sequence_number = 42
symbol_id = 7
bid_price = 1743100
ask_price = 1743300
bid_size = 800
ask_size = 500
timestamp = 123456789

# Field widths in bits.
# These must match the packet format that the SystemVerilog decoder expects.
MESSAGE_TYPE_W = 8
SEQUENCE_NUMBER_W = 32
SYMBOL_ID_W = 16
PRICE_W = 32
SIZE_W = 32
TIMESTAMP_W = 64

# Total packet width:
# 8 + 32 + 16 + 32 + 32 + 32 + 32 + 64 = 248 bits
PACKET_W = 248


def pack_uint(name, value, width):
    """
    Convert an unsigned integer into a fixed-width binary string.

    This prevents silent overflow. If a value does not fit in its assigned
    bit width, the function raises an error instead of creating a bad packet.
    """
    max_value = (1 << width) - 1

    if value < 0 or value > max_value:
        raise ValueError(
            f"{name}={value} does not fit in {width} bits "
            f"(max={max_value})"
        )

    return f"{value:0{width}b}"


# Pack each field into a binary string and concatenate them in packet order.
# The SystemVerilog decoder must slice packet_in using this same order.
packet_bits = (
    pack_uint("message_type", message_type, MESSAGE_TYPE_W)
    + pack_uint("sequence_number", sequence_number, SEQUENCE_NUMBER_W)
    + pack_uint("symbol_id", symbol_id, SYMBOL_ID_W)
    + pack_uint("bid_price", bid_price, PRICE_W)
    + pack_uint("ask_price", ask_price, PRICE_W)
    + pack_uint("bid_size", bid_size, SIZE_W)
    + pack_uint("ask_size", ask_size, SIZE_W)
    + pack_uint("timestamp", timestamp, TIMESTAMP_W)
)

# Make sure the final packet is exactly the expected width.
# If this fails, one of the fields is the wrong size.
assert len(packet_bits) == PACKET_W

# Convert the binary string to an integer, then print it as hex.
# 248 bits / 4 = 62 hex digits.
packet_int = int(packet_bits, 2)
packet_hex = f"{packet_int:062x}"

print("packet width:", len(packet_bits))
print("packet bits:", packet_bits)
print("packet hex:", packet_hex)