import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  selector: "app-dialog",
  template: "passed in {{ data.message }}",
  templateUrl: "dialog.component.html"
})
export class DialogComponent {
  answer: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DialogComponent>
  ) {}

  confirmSelection() {
    this.answer = "ok";
    this.dialogRef.close(this.answer);
  }
  cancelSelection() {
    this.answer = "cancel";
    this.dialogRef.close(this.answer);
  }
}
