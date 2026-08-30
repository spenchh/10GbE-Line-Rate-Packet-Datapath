module market_data_decoder (
  input logic clk,
  input logic rst_n,
  input logic packet_valid,
  input logic [247:0] packet_in,

  output logic decoded_valid,
  output logic [7:0] message_type,
  output logic [31:0] sequence_number,
  output logic [15:0] symbol_id,
  output logic [31:0] bid_price,
  output logic [31:0] ask_price,
  output logic [31:0] bid_size,
  output logic [31:0] ask_size,
  output logic [63:0] timestamp 
);

