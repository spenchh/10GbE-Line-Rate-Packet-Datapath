module market_data_decoder (
  input clk,
  input rst,

  
  input [7:0] message_type,
  input [31:0] sequence_number,
  input [15:0] symbol_id,
  input [31:0] bid_price,
  input [31:0] ask_price,
  input [31:0] bid_size,
  input [31:0] ask_size,
  input [63:0] timestamp 
);

